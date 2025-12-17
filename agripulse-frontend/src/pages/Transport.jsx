import React, { useEffect, useState, useRef } from "react";
import { fetchTransport, createTransport } from "../api/transport";
import useAuthFetch from "../hooks/useAuthFetch";
import TransportCard from "../components/TransportCard";
import LocationSelector from "../components/LocationSelector";
import { TruckIcon, PlusIcon, ArrowPathIcon, XMarkIcon, ArrowUpIcon, FunnelIcon } from "@heroicons/react/24/outline";
import routesData from "../data/routes.json";
import { useToast } from "../contexts/ToastContext";

export default function TransportPage() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    vehicleType: "truck",
    vehicleRegistration: "",
    capacityKg: 0,
    route: "",
    selectedRoute: "",
    origin: { county: "", town: "" },
    destination: { county: "", town: "" },
    pricePerKm: 0,
    minimumCharge: 0,
    vehicleImage: null
  });
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    vehicleType: "",
    minCapacity: "",
    maxCapacity: "",
    minPrice: "",
    maxPrice: "",
    route: "",
    county: "",
    verified: "",
    status: "",
    sortBy: "newest"
  });

  const formRef = useRef(null);
  const authFetch = useAuthFetch();

  // On desktop, always show filters
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowFilters(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show scroll to top button when scrolled and handle fixed elements near footer
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      // Make fixed elements scroll when footer is near (both mobile and desktop)
      const footer = document.querySelector('footer');
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (window.innerWidth < 768) {
          // Mobile - hide buttons when footer is near
          const createFormEl = document.querySelector('[data-create-form-mobile]');
          const filtersEl = document.querySelector('[data-filters-mobile]');
          const filtersButtonEl = document.querySelector('[data-filters-button-mobile]');
          
          // Hide buttons when footer is visible in viewport (footerTop < windowHeight)
          // Add buffer to hide slightly before footer appears
          const buffer = 150; // Hide buttons 150px before footer reaches viewport
          
          if (footerTop < windowHeight - buffer) {
            // Footer is near or visible - hide buttons completely
            if (createFormEl) {
              createFormEl.style.display = 'none';
              createFormEl.style.visibility = 'hidden';
              createFormEl.style.pointerEvents = 'none';
              createFormEl.style.opacity = '0';
            }
            if (filtersEl) {
              filtersEl.style.display = 'none';
              filtersEl.style.visibility = 'hidden';
              filtersEl.style.pointerEvents = 'none';
              filtersEl.style.opacity = '0';
            }
            if (filtersButtonEl) {
              filtersButtonEl.style.display = 'none';
              filtersButtonEl.style.visibility = 'hidden';
              filtersButtonEl.style.pointerEvents = 'none';
              filtersButtonEl.style.opacity = '0';
            }
          } else {
            // Footer is far - show buttons
            if (createFormEl) {
              createFormEl.style.display = 'block';
              createFormEl.style.visibility = 'visible';
              createFormEl.style.pointerEvents = 'auto';
              createFormEl.style.opacity = '1';
              createFormEl.style.position = 'fixed';
              createFormEl.style.top = '72px';
            }
            if (filtersEl) {
              filtersEl.style.display = showFilters ? 'block' : 'none';
              filtersEl.style.visibility = showFilters ? 'visible' : 'hidden';
              filtersEl.style.pointerEvents = showFilters ? 'auto' : 'none';
              filtersEl.style.opacity = showFilters ? '1' : '0';
              if (showFilters) {
                filtersEl.style.position = 'fixed';
                filtersEl.style.top = showCreateForm ? 'calc(72px + 8rem)' : 'calc(72px + 7.5rem)';
              }
            }
            if (filtersButtonEl) {
              filtersButtonEl.style.display = 'block';
              filtersButtonEl.style.visibility = 'visible';
              filtersButtonEl.style.pointerEvents = 'auto';
              filtersButtonEl.style.opacity = '1';
              filtersButtonEl.style.position = 'fixed';
              filtersButtonEl.style.top = showCreateForm ? 'calc(72px + 4rem)' : 'calc(72px + 3.5rem)';
            }
          }
        } else {
          // Desktop
          const createFormEl = document.querySelector('[data-create-form-desktop]');
          const filtersEl = document.querySelector('[data-filters-desktop]');
          
          // Calculate if sidebar would overlap footer
          const sidebarTop = 88;
          const sidebarBuffer = 20;
          
          if (footerTop < windowHeight) {
            const availableSpace = footerTop - sidebarBuffer;
            const sidebarHeight = createFormEl ? createFormEl.offsetHeight : 400;
            
            if (availableSpace < sidebarHeight) {
              const newTop = Math.max(sidebarTop, footerTop - sidebarHeight - sidebarBuffer);
              if (createFormEl) {
                createFormEl.style.position = 'absolute';
                createFormEl.style.top = `${newTop}px`;
                createFormEl.style.right = '1rem';
              }
              if (filtersEl) {
                const filterHeight = filtersEl.offsetHeight || 400;
                const filterNewTop = Math.max(sidebarTop, footerTop - filterHeight - sidebarBuffer);
                filtersEl.style.position = 'absolute';
                filtersEl.style.top = `${filterNewTop}px`;
                filtersEl.style.left = '1rem';
              }
            } else {
              if (createFormEl) {
                createFormEl.style.position = 'fixed';
                createFormEl.style.top = '88px';
                createFormEl.style.right = '1rem';
              }
              if (filtersEl) {
                filtersEl.style.position = 'fixed';
                filtersEl.style.top = '88px';
                filtersEl.style.left = '1rem';
              }
            }
          } else {
            if (createFormEl) {
              createFormEl.style.position = 'fixed';
              createFormEl.style.top = '88px';
              createFormEl.style.right = '1rem';
            }
            if (filtersEl) {
              filtersEl.style.position = 'fixed';
              filtersEl.style.top = '88px';
              filtersEl.style.left = '1rem';
            }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showCreateForm, showFilters]);

  // Scroll form to bottom when opened
  useEffect(() => {
    if (showCreateForm && formRef.current) {
      setTimeout(() => {
        const scrollableDiv = formRef.current?.querySelector('.overflow-y-auto');
        if (scrollableDiv) {
          scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
      }, 100);
    }
  }, [showCreateForm]);

  useEffect(() => { load(); }, [filters]);

  const handleRouteSelect = (routeName) => {
    const route = routesData.routes.find(r => r.name === routeName);
    if (route) {
      setForm({
        ...form,
        selectedRoute: routeName,
        route: routeName,
        origin: route.origin,
        destination: route.destination
      });
    }
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImagePreview(reader.result);
        setForm({...form, vehicleImage: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      // Build query from filters
      const query = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== "") {
          query[key] = filters[key];
        }
      });
      
      const data = await fetchTransport(query);
      if (data.transports) {
        setTransports(data.transports);
      } else {
        setTransports(Array.isArray(data) ? data : []);
      }
    } catch(err) {
      console.error(err);
      showToast("Failed to load transport", "error");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    
    if (!form.vehicleImage) {
      showToast("Please upload a picture of your vehicle", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const created = await createTransport(form);
      setTransports(s => [created, ...s]);
      setForm({
        vehicleType: "truck",
        vehicleRegistration: "",
        capacityKg: 0,
        route: "",
        selectedRoute: "",
        origin: { county: "", town: "" },
        destination: { county: "", town: "" },
        pricePerKm: 0,
        minimumCharge: 0,
        vehicleImage: null
      });
      setVehicleImagePreview(null);
      setShowCreateForm(false);
      showToast("Transport availability posted successfully! 🎉", "success");
    } catch(err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create transport", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:-mx-4 pt-20 md:pt-4">
      {/* Create Form Button - Mobile: Top/Collapsible, Desktop: Right Sidebar/Always Expanded */}
      <div className="order-1 md:order-3 md:w-0 md:overflow-hidden flex-shrink-0">
        {/* Mobile: Collapsible and Fixed */}
        <div data-create-form-mobile className="md:hidden fixed left-0 right-0 z-40 px-4" style={{ top: '88px' }}>
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm">Post Transport</span>
            </button>
          ) : (
            <div ref={formRef} className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
              <div className="p-4 pb-3 flex-shrink-0 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">Post Transport</h3>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <form onSubmit={onCreate} className="p-4 pt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type *</label>
                    <select
                      value={form.vehicleType}
                      onChange={(e)=>setForm({...form, vehicleType:e.target.value})}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                    >
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Kg) *</label>
                    <input
                      type="number"
                      value={form.capacityKg || ""}
                      onChange={(e)=>setForm({...form, capacityKg: e.target.value === "" ? "" : Number(e.target.value)})}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Route *</label>
                    <select
                      value={form.selectedRoute}
                      onChange={(e) => handleRouteSelect(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                    >
                      <option value="">-- Select a route --</option>
                      {routesData.routes.map((route, idx) => (
                        <option key={idx} value={route.name}>
                          {route.name} ({route.distance} km)
                        </option>
                      ))}
                    </select>
                    {form.selectedRoute && (
                      <div className="mt-2 text-xs text-slate-600 bg-blue-50 p-2 rounded">
                        <div>Origin: {form.origin.county}, {form.origin.town}</div>
                        <div>Destination: {form.destination.county}, {form.destination.town}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Route (Optional)</label>
                    <input
                      value={form.route}
                      onChange={(e)=>setForm({...form, route:e.target.value})}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Or enter custom route"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Km (KES) *</label>
                    <input
                      type="number"
                      value={form.pricePerKm || ""}
                      onChange={(e)=>setForm({...form, pricePerKm: e.target.value === "" ? "" : Number(e.target.value)})}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Charge (KES)</label>
                    <input
                      type="number"
                      value={form.minimumCharge || ""}
                      onChange={(e)=>setForm({...form, minimumCharge: e.target.value === "" ? "" : Number(e.target.value)})}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Photo *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVehicleImageChange}
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required={!form.vehicleImage}
                    />
                    {vehicleImagePreview && (
                      <div className="mt-2">
                        <img 
                          src={vehicleImagePreview} 
                          alt="Vehicle Preview"
                          className="w-full max-w-md h-32 object-contain border border-slate-200 rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Upload a clear image of your vehicle</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Post Transport
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop: Always Expanded and Fixed */}
        <div data-create-form-desktop className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-100 fixed right-4 w-80 flex flex-col overflow-hidden z-40"
          style={{ top: '88px', maxHeight: 'calc(100vh - 120px)', bottom: 'auto' }}
        >
          <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">Post Transport</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - 200px)', WebkitOverflowScrolling: 'touch' }}>
            <form onSubmit={onCreate} className="p-4 md:p-6 pt-3 md:pt-4 space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Vehicle Type *</label>
                <select
                  value={form.vehicleType}
                  onChange={(e)=>setForm({...form, vehicleType:e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Capacity (Kg) *</label>
                <input
                  type="number"
                  value={form.capacityKg || ""}
                  onChange={(e)=>setForm({...form, capacityKg: e.target.value === "" ? "" : Number(e.target.value)})}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Select Route *</label>
                <select
                  value={form.selectedRoute}
                  onChange={(e) => handleRouteSelect(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                >
                  <option value="">-- Select a route --</option>
                  {routesData.routes.map((route, idx) => (
                    <option key={idx} value={route.name}>
                      {route.name} ({route.distance} km)
                    </option>
                  ))}
                </select>
                {form.selectedRoute && (
                  <div className="mt-2 text-[10px] md:text-xs text-slate-600 bg-blue-50 p-2 rounded">
                    <div>Origin: {form.origin.county}, {form.origin.town}</div>
                    <div>Destination: {form.destination.county}, {form.destination.town}</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Custom Route (Optional)</label>
                <input
                  value={form.route}
                  onChange={(e)=>setForm({...form, route:e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Or enter custom route"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Price per Km (KES) *</label>
                <input
                  type="number"
                  value={form.pricePerKm || ""}
                  onChange={(e)=>setForm({...form, pricePerKm: e.target.value === "" ? "" : Number(e.target.value)})}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Minimum Charge (KES)</label>
                <input
                  type="number"
                  value={form.minimumCharge || ""}
                  onChange={(e)=>setForm({...form, minimumCharge: e.target.value === "" ? "" : Number(e.target.value)})}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5">Vehicle Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleVehicleImageChange}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required={!form.vehicleImage}
                />
                {vehicleImagePreview && (
                  <div className="mt-2 md:mt-3">
                    <img 
                      src={vehicleImagePreview} 
                      alt="Vehicle Preview"
                      className="w-full max-w-md h-32 md:h-48 object-contain border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">Upload a clear image of your vehicle</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
                    Post Transport
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Filters Sidebar - Collapsible on mobile, always expanded and sticky on PC */}
      <div className="order-2 md:order-1 md:w-0 md:overflow-hidden flex-shrink-0">
        {/* Mobile: Collapsible and Fixed */}
        <button
          data-filters-button-mobile
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden fixed left-0 right-0 z-30 mx-4 flex items-center justify-between bg-white p-4 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all"
          style={{ top: showCreateForm ? 'calc(72px + 4rem)' : 'calc(72px + 3.5rem)' }}
        >
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800">Filters</h3>
          </div>
          {showFilters ? <XMarkIcon className="w-5 h-5 text-slate-600" /> : <FunnelIcon className="w-5 h-5 text-slate-600" />}
        </button>
        {showFilters ? (
          <div data-filters-mobile className="md:hidden bg-white p-4 rounded-xl shadow-lg border border-slate-100 fixed left-0 right-0 z-30 mx-4 max-h-[calc(100vh-10rem)] overflow-y-auto"
            style={{ top: showCreateForm ? 'calc(72px + 8rem)' : 'calc(72px + 7.5rem)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-600 hover:text-slate-800 transition-colors"
                aria-label="Close filters"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => updateFilter("vehicleType", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity Range (Kg)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minCapacity}
                    onChange={(e) => updateFilter("minCapacity", e.target.value)}
                    placeholder="Min"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={filters.maxCapacity}
                    onChange={(e) => updateFilter("maxCapacity", e.target.value)}
                    placeholder="Max"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Km Range (KES)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    placeholder="Min"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    placeholder="Max"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                <input
                  type="text"
                  value={filters.route}
                  onChange={(e) => updateFilter("route", e.target.value)}
                  placeholder="e.g., Nairobi-Mombasa"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">County</label>
                <input
                  type="text"
                  value={filters.county}
                  onChange={(e) => updateFilter("county", e.target.value)}
                  placeholder="e.g., Nairobi"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity_asc">Capacity: Low to High</option>
                  <option value="capacity_desc">Capacity: High to Low</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.verified === "true"}
                    onChange={(e) => updateFilter("verified", e.target.checked ? "true" : "")}
                    className="rounded"
                  />
                  <span>Verified Drivers Only</span>
                </label>
              </div>
              
              <button
                onClick={() => setFilters({
                  vehicleType: "", minCapacity: "", maxCapacity: "", minPrice: "", maxPrice: "",
                  route: "", county: "", verified: "", status: "", sortBy: "newest"
                })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : null}
        {/* Always show on desktop - Fixed */}
        <div className="hidden md:block bg-white p-4 rounded-xl shadow-lg border border-slate-100 fixed left-4 w-64 overflow-y-auto z-40"
          data-filters-desktop
          style={{ top: '88px', maxHeight: 'calc(100vh - 120px)', bottom: 'auto' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-800">Filters</h3>
            </div>
          </div>
        
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={filters.vehicleType}
                onChange={(e) => updateFilter("vehicleType", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity Range (Kg)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minCapacity}
                  onChange={(e) => updateFilter("minCapacity", e.target.value)}
                  placeholder="Min"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  value={filters.maxCapacity}
                  onChange={(e) => updateFilter("maxCapacity", e.target.value)}
                  placeholder="Max"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Km Range (KES)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  placeholder="Min"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
              <input
                type="text"
                value={filters.route}
                onChange={(e) => updateFilter("route", e.target.value)}
                placeholder="e.g., Nairobi-Mombasa"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">County</label>
              <input
                type="text"
                value={filters.county}
                onChange={(e) => updateFilter("county", e.target.value)}
                placeholder="e.g., Nairobi"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_asc">Capacity: Low to High</option>
                <option value="capacity_desc">Capacity: High to Low</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.verified === "true"}
                  onChange={(e) => updateFilter("verified", e.target.checked ? "true" : "")}
                  className="rounded"
                />
                <span>Verified Drivers Only</span>
              </label>
            </div>
            
            <button
              onClick={() => setFilters({
                vehicleType: "", minCapacity: "", maxCapacity: "", minPrice: "", maxPrice: "",
                route: "", county: "", verified: "", status: "", sortBy: "newest"
              })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="order-3 md:order-2 flex-1 md:-mx-4 md:ml-[17rem] md:mr-[21rem] pt-40 md:pt-24">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-800">Transport Pool</h2>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 md:p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <ArrowPathIcon className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : transports.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-xl shadow-md text-center">
              <TruckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No transport available. Post one to get started!</p>
            </div>
          ) : (
            transports.map(t => (
              <TransportCard 
                key={t._id} 
                item={t} 
                isExpanded={expandedCardId === t._id}
                onExpand={(id) => setExpandedCardId(id)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
