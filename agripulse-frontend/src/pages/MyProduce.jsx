import React, { useEffect, useState } from "react";
import { fetchProduce, updateProduceListing, deleteProduceListing } from "../api/produce";
import { getCurrentUser } from "../api/users";
import ProduceCard from "../components/ProduceCard";
import { PencilIcon, TrashIcon, ArrowPathIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useToast } from "../contexts/ToastContext";

export default function MyProducePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?._id) {
      loadListings();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await fetchProduce({ farmerId: user._id });
      setListings(data.listings || []);
    } catch (err) {
      console.error("Error loading listings:", err);
      showToast("Failed to load your produce listings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    setEditingId(listing._id);
    setEditForm({
      crop: listing.crop || "",
      category: listing.category || "",
      quantityKg: listing.quantityKg || 0,
      expectedPrice: listing.expectedPrice || 0,
      isPriceNegotiable: listing.isPriceNegotiable !== undefined ? listing.isPriceNegotiable : true,
      location: listing.location || { county: "", subcounty: "", town: "" },
      readyDate: listing.readyDate || "",
      images: listing.images || []
    });
  };

  const handleSaveEdit = async (listingId) => {
    try {
      await updateProduceListing(listingId, editForm);
      showToast("Edit request submitted. Waiting for admin approval. ⏳", "success");
      setEditingId(null);
      setEditForm({});
      loadListings();
    } catch (err) {
      console.error("Error updating listing:", err);
      showToast(err.response?.data?.error || "Failed to update listing", "error");
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteProduceListing(listingId);
      showToast("Listing deleted successfully", "success");
      loadListings();
    } catch (err) {
      console.error("Error deleting listing:", err);
      showToast(err.response?.data?.error || "Failed to delete listing", "error");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user.roles?.includes("farmer")) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-slate-600">You must be a farmer to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Produce Listings</h1>
        <p className="text-slate-600">Manage your produce listings. Edit requests require admin approval.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <CheckBadgeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">You haven't posted any produce listings yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <div key={listing._id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {editingId === listing._id ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Listing</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Crop</label>
                      <input
                        type="text"
                        value={editForm.crop}
                        onChange={(e) => setEditForm({...editForm, crop: e.target.value})}
                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity (kg)</label>
                      <input
                        type="number"
                        value={editForm.quantityKg}
                        onChange={(e) => setEditForm({...editForm, quantityKg: e.target.value === "" ? "" : Number(e.target.value)})}
                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Price (KES)</label>
                      <input
                        type="number"
                        value={editForm.expectedPrice}
                        onChange={(e) => setEditForm({...editForm, expectedPrice: e.target.value === "" ? "" : Number(e.target.value)})}
                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                        min="0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(listing._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Submit for Approval
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm({});
                        }}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ProduceCard item={listing} showActions={false} />
                  <div className="p-4 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                    {listing.pendingEdit && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Edit Pending Approval
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

