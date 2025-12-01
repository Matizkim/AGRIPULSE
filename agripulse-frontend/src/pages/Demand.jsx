import React, { useEffect, useState } from "react";
import { fetchDemands, createDemand } from "../api/demand";
import { createMatch } from "../api/match";
import { fetchProduce } from "../api/produce";
import { useSocket } from "../contexts/SocketContext";
import DemandCard from "../components/DemandCard";
import CropSelector from "../components/CropSelector";
import LocationSelector from "../components/LocationSelector";
import useAuthFetch from "../hooks/useAuthFetch";
import { ClipboardDocumentListIcon, PlusIcon, ArrowPathIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "../contexts/ToastContext";

export default function DemandPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const { showToast } = useToast();
  
  // Form state
  const [form, setForm] = useState({ 
    crop: "", 
    qtyKg: 0, 
    priceOffer: 0,
    isPriceNegotiable: true,
    location: { county: "", subcounty: "", town: "" },
    urgency: "medium",
    preferredPickupRadiusKm: 50,
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    crop: "",
    category: "",
    county: "",
    minPrice: "",
    maxPrice: "",
    urgency: "",
    negotiable: "",
    verified: "",
    sortBy: "newest"
  });
  
  // Offer Supply Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [myProduce, setMyProduce] = useState([]);
  const [loadingProduce, setLoadingProduce] = useState(false);
  const [offerForm, setOfferForm] = useState({ listingId: "", priceAgreed: 0, message: "" });
  
  const authFetch = useAuthFetch();
  const socket = useSocket();

  useEffect(() => { load(); }, [filters]);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewDemand = (demand) => {
      console.log("🔔 New demand posted:", demand);
      // Only add if it matches current filters
      setDemands(prev => [demand, ...prev]);
    };

    socket.on("newDemand", handleNewDemand);

    return () => {
      socket.off("newDemand", handleNewDemand);
    };
  }, [socket]);

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
      
      const data = await fetchDemands(query);
      // Handle new API response structure
      if (data.demands) {
        setDemands(data.demands);
        setPagination(data.pagination || {});
      } else {
        // Fallback for old structure
        setDemands(Array.isArray(data) ? data : []);
      }
    } catch(err) {
      console.error(err);
      showToast("Failed to load demands", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast("Please select valid image files", "warning");
      return;
    }

    // Convert files to base64
    const promises = imageFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64Images) => {
      setImagePreviews([...imagePreviews, ...base64Images]);
      setForm({...form, images: [...form.images, ...base64Images]});
    });
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setForm({...form, images: newImages});
    setImagePreviews(newPreviews);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    
    // Validate at least 1 image
    if (!form.images || form.images.length < 1) {
      showToast("Please upload at least 1 image of the item you need", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const created = await createDemand(form);
      setDemands(s => [created, ...s]);
      setForm({ 
        crop: "", 
        qtyKg: 0, 
        priceOffer: 0,
        isPriceNegotiable: true,
        location: { county: "", subcounty: "", town: "" },
        urgency: "medium",
        preferredPickupRadiusKm: 50,
        images: []
      });
      setImagePreviews([]);
      showToast("Demand posted successfully! 🎉", "success");
    } catch(err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create demand", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOfferSupply = async (demand) => {
    setSelectedDemand(demand);
    setShowOfferModal(true);
    setLoadingProduce(true);
    
    try {
      // Fetch farmer's produce listings that match the demand crop
      const data = await fetchProduce({ crop: demand.crop, status: 'available' });
      setMyProduce(Array.isArray(data) ? data : (data.listings || []));
    } catch (err) {
      console.error("Failed to load produce:", err);
      showToast("Could not load your produce listings", "error");
    } finally {
      setLoadingProduce(false);
    }
  };

  const handleCreateMatchFromOffer = async (e) => {
    e.preventDefault();
    
    if (!offerForm.listingId) {
      showToast("Please select a produce listing", "warning");
      return;
    }
    
    try {
      await createMatch({
        listingId: offerForm.listingId,
        demandId: selectedDemand._id,
        priceAgreed: offerForm.priceAgreed || selectedDemand.priceOffer || 0,
        message: offerForm.message || "Offering supply for your demand"
      });
      
      showToast("Match proposal sent successfully! ✅", "success");
      setShowOfferModal(false);
      setOfferForm({ listingId: "", priceAgreed: 0, message: "" });
      load(); // Reload demands
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create match", "error");
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="md:col-span-1">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800">Filters</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search Crop</label>
              <input
                type="text"
                value={filters.crop}
                onChange={(e) => updateFilter("crop", e.target.value)}
                placeholder="e.g., tomatoes"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="cereals">Cereals</option>
                <option value="legumes">Legumes</option>
                <option value="roots">Roots</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">County</label>
              <input
                type="text"
                value={filters.county}
                onChange={(e) => updateFilter("county", e.target.value)}
                placeholder="e.g., Nairobi"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
              <select
                value={filters.urgency}
                onChange={(e) => updateFilter("urgency", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Range (KES)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  placeholder="Min"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-emerald-500 outline-none"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="urgency">Urgency</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity">Quantity</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.negotiable === "true"}
                  onChange={(e) => updateFilter("negotiable", e.target.checked ? "true" : "")}
                  className="rounded"
                />
                <span>Negotiable Only</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.verified === "true"}
                  onChange={(e) => updateFilter("verified", e.target.checked ? "true" : "")}
                  className="rounded"
                />
                <span>Verified Buyers</span>
              </label>
            </div>
            
            <button
              onClick={() => setFilters({
                crop: "", category: "", county: "", minPrice: "", maxPrice: "",
                urgency: "", negotiable: "", verified: "", sortBy: "newest"
              })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Market Demands</h2>
            {pagination.total > 0 && (
              <span className="text-sm text-slate-500">({pagination.total} found)</span>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : demands.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No market demands found. Post one to get started!</p>
            </div>
          ) : (
            demands.map(d => <DemandCard key={d._id} item={d} onOfferSupply={handleOfferSupply} />)
          )}
        </div>
      </div>

      {/* Create Form Sidebar */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <PlusIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Post Demand</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={onCreate} className="p-6 pt-4 space-y-4">
            <CropSelector
              value={form.crop}
              onChange={(crop) => setForm({...form, crop})}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity Needed (Kg) *</label>
              <input
                type="number"
                value={form.qtyKg || ""}
                onChange={(e)=>setForm({...form, qtyKg: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Offer (KES)</label>
              <input
                type="number"
                value={form.priceOffer || ""}
                onChange={(e)=>setForm({...form, priceOffer: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPriceNegotiable}
                  onChange={(e)=>setForm({...form, isPriceNegotiable:e.target.checked})}
                  className="rounded"
                />
                <span>Price Negotiable</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e)=>setForm({...form, urgency:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <LocationSelector
              value={form.location}
              onChange={(location) => setForm({...form, location})}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pickup Radius (Km)</label>
              <input
                type="number"
                value={form.preferredPickupRadiusKm || ""}
                onChange={(e)=>setForm({...form, preferredPickupRadiusKm: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reference Images * (At least 1 required - show what you need)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required={form.images.length < 1}
              />
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img 
                        src={preview} 
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.images.length < 1 && (
                <p className="text-xs text-red-600 mt-1">Please upload at least 1 reference image</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Post Demand
                </>
              )}
            </button>
          </form>
          </div>
        </div>
      </div>

      {/* Offer Supply Modal */}
      {showOfferModal && selectedDemand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-slate-800">Offer Supply for {selectedDemand.crop}</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-700"><strong>Buyer needs:</strong> {selectedDemand.qtyKg} kg</p>
                <p className="text-sm text-slate-700"><strong>Location:</strong> {selectedDemand.location?.county}</p>
                <p className="text-sm text-slate-700"><strong>Offering:</strong> {selectedDemand.priceOffer ? `KES ${selectedDemand.priceOffer.toLocaleString()}` : "Negotiable"}</p>
              </div>

              <form onSubmit={handleCreateMatchFromOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Produce *</label>
                  {loadingProduce ? (
                    <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
                  ) : myProduce.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                      No available {selectedDemand.crop} listings found. Please create a produce listing first.
                    </div>
                  ) : (
                    <select
                      value={offerForm.listingId}
                      onChange={(e) => setOfferForm({...offerForm, listingId: e.target.value})}
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
                      required
                    >
                      <option value="">-- Select listing --</option>
                      {myProduce.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.crop} - {p.quantityKg}kg @ {p.location?.county} - KES {p.expectedPrice || 'Negotiable'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Offer Price (KES) *</label>
                  <input
                    type="number"
                    value={offerForm.priceAgreed || ""}
                    onChange={(e) => setOfferForm({...offerForm, priceAgreed: e.target.value === "" ? "" : Number(e.target.value)})}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
                    placeholder={selectedDemand.priceOffer || "Enter your price"}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message (Optional)</label>
                  <textarea
                    value={offerForm.message}
                    onChange={(e) => setOfferForm({...offerForm, message: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
                    rows="3"
                    placeholder="Add any additional information..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!offerForm.listingId || myProduce.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
