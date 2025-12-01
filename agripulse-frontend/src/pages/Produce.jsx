import React, { useEffect, useState } from "react";
import { fetchProduce, createProduceListing } from "../api/produce";
import { createMatch } from "../api/match";
import { fetchDemands } from "../api/demand";
import { useSocket } from "../contexts/SocketContext";
import ProduceCard from "../components/ProduceCard";
import CropSelector from "../components/CropSelector";
import LocationSelector from "../components/LocationSelector";
import useAuthFetch from "../hooks/useAuthFetch";
import { ShoppingBagIcon, PlusIcon, ArrowPathIcon, FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "../contexts/ToastContext";

export default function ProducePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const { showToast } = useToast();
  
  // Form state
  const [form, setForm] = useState({ 
    crop: "", 
    quantityKg: 0, 
    expectedPrice: 0,
    isPriceNegotiable: true,
    location: { county: "", subcounty: "", town: "" },
    readyDate: "",
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
    minQuantity: "",
    negotiable: "",
    verified: "",
    promoted: "",
    sortBy: "newest"
  });
  
  // Buy Now Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [myDemands, setMyDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(false);
  const [buyForm, setBuyForm] = useState({ demandId: "", priceAgreed: 0, message: "" });
  
  const authFetch = useAuthFetch();
  const socket = useSocket();

  useEffect(() => { load(); }, [filters]);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewListing = (listing) => {
      console.log("🔔 New produce listed:", listing);
      // Only add if it matches current filters
      setListings(prev => [listing, ...prev]);
    };

    socket.on("newListing", handleNewListing);

    return () => {
      socket.off("newListing", handleNewListing);
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
      
      const data = await fetchProduce(query);
      // Handle new API response structure
      if (data.listings) {
        setListings(data.listings);
        setPagination(data.pagination || {});
      } else {
        // Fallback for old structure
        setListings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      alert("Could not load produce listings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert("Please select valid image files");
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
      showToast("Please upload at least 1 image of the item", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const created = await createProduceListing(form);
      setListings((s) => [created, ...s]);
      setForm({ 
        crop: "", 
        quantityKg: 0, 
        expectedPrice: 0,
        isPriceNegotiable: true,
        location: { county: "", subcounty: "", town: "" },
        readyDate: "",
        images: []
      });
      setImagePreviews([]);
      showToast("Produce listing created successfully! 🎉", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBuyNow = async (produce) => {
    setSelectedProduce(produce);
    setShowBuyModal(true);
    setLoadingDemands(true);
    
    try {
      // Fetch buyer's demands that match the produce crop
      const data = await fetchDemands({ crop: produce.crop, status: 'open' });
      setMyDemands(Array.isArray(data) ? data : (data.demands || []));
    } catch (err) {
      console.error("Failed to load demands:", err);
      showToast("Could not load your demands", "error");
    } finally {
      setLoadingDemands(false);
    }
  };

  const handleCreateMatchFromBuy = async (e) => {
    e.preventDefault();
    
    if (!buyForm.demandId) {
      showToast("Please select a demand or create a new one", "warning");
      return;
    }
    
    try {
      await createMatch({
        listingId: selectedProduce._id,
        demandId: buyForm.demandId,
        priceAgreed: buyForm.priceAgreed || selectedProduce.expectedPrice || 0,
        message: buyForm.message || "I want to buy your produce"
      });
      
      showToast("Match proposal sent successfully! ✅", "success");
      setShowBuyModal(false);
      setBuyForm({ demandId: "", priceAgreed: 0, message: "" });
      load(); // Reload produce
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Range (KES)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  placeholder="Min"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-green-500 outline-none"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm focus:border-green-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity">Quantity</option>
                <option value="promoted">Promoted First</option>
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
                <span>Verified Sellers</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.promoted === "true"}
                  onChange={(e) => updateFilter("promoted", e.target.checked ? "true" : "")}
                  className="rounded"
                />
                <span>Promoted Listings</span>
              </label>
            </div>
            
            <button
              onClick={() => setFilters({
                crop: "", category: "", county: "", minPrice: "", maxPrice: "",
                minQuantity: "", negotiable: "", verified: "", promoted: "", sortBy: "newest"
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
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Produce Listings</h2>
            {pagination.total > 0 && (
              <span className="text-sm text-slate-500">({pagination.total} found)</span>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <ShoppingBagIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No produce listings found. Create one to get started!</p>
            </div>
          ) : (
            listings.map((p) => <ProduceCard key={p._id} item={p} onBuyNow={handleBuyNow} />)
          )}
        </div>
      </div>

      {/* Create Form Sidebar */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlusIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Create Listing</h3>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity (Kg) *</label>
              <input
                type="number"
                value={form.quantityKg || ""}
                onChange={(e)=>setForm({...form, quantityKg: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Price (KES)</label>
              <input
                type="number"
                value={form.expectedPrice || ""}
                onChange={(e)=>setForm({...form, expectedPrice: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
            <LocationSelector
              value={form.location}
              onChange={(location) => setForm({...form, location})}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Product Images * (At least 1 required)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
                <p className="text-xs text-red-600 mt-1">Please upload at least 1 image</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Create Listing
                </>
              )}
            </button>
          </form>
          </div>
        </div>
      </div>

      {/* Buy Now Modal */}
      {showBuyModal && selectedProduce && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-slate-800">Buy {selectedProduce.crop}</h3>
              <button onClick={() => setShowBuyModal(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-700"><strong>Available:</strong> {selectedProduce.quantityKg} kg</p>
                <p className="text-sm text-slate-700"><strong>Location:</strong> {selectedProduce.location?.county}</p>
                <p className="text-sm text-slate-700"><strong>Price:</strong> {selectedProduce.expectedPrice ? `KES ${selectedProduce.expectedPrice.toLocaleString()}` : "Negotiable"}</p>
              </div>

              <form onSubmit={handleCreateMatchFromBuy} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Demand *</label>
                  {loadingDemands ? (
                    <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
                  ) : myDemands.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                      No matching demands found. You can create a demand or proceed without one.
                    </div>
                  ) : (
                    <select
                      value={buyForm.demandId}
                      onChange={(e) => setBuyForm({...buyForm, demandId: e.target.value})}
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                      required
                    >
                      <option value="">-- Select demand --</option>
                      {myDemands.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.crop} - {d.qtyKg}kg @ {d.location?.county} - KES {d.priceOffer || 'Negotiable'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Offer Price (KES) *</label>
                  <input
                    type="number"
                    value={buyForm.priceAgreed || ""}
                    onChange={(e) => setBuyForm({...buyForm, priceAgreed: e.target.value === "" ? "" : Number(e.target.value)})}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                    placeholder={selectedProduce.expectedPrice || "Enter your offer"}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message (Optional)</label>
                  <textarea
                    value={buyForm.message}
                    onChange={(e) => setBuyForm({...buyForm, message: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                    rows="3"
                    placeholder="Add any additional information..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBuyModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!buyForm.demandId}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
