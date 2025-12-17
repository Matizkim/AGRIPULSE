import React, { useEffect, useState } from "react";
import { fetchDemands, deleteDemand } from "../api/demand";
import { getCurrentUser } from "../api/users";
import DemandCard from "../components/DemandCard";
import { TrashIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function MyDemandsPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?._id) {
      loadDemands();
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

  const loadDemands = async () => {
    setLoading(true);
    try {
      const data = await fetchDemands({ buyerId: user._id });
      setDemands(data.demands || []);
    } catch (err) {
      console.error("Error loading demands:", err);
      alert("Failed to load your demand listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (demandId) => {
    if (!window.confirm("Are you sure you want to delete this demand? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteDemand(demandId);
      alert("Demand deleted successfully");
      loadDemands();
    } catch (err) {
      console.error("Error deleting demand:", err);
      alert(err.response?.data?.error || "Failed to delete demand");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user.roles?.includes("buyer")) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-slate-600">You must be a buyer to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Demand Listings</h1>
        <p className="text-slate-600">Manage your demand listings.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : demands.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <CheckBadgeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">You haven't posted any demand listings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {demands.map((demand) => (
            <div 
              key={demand._id} 
              className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col ${expandedCardId === demand._id ? 'sm:col-span-2 lg:col-span-3' : ''}`}
            >
              <div className="flex-1">
                <DemandCard 
                  item={demand} 
                  showActions={false}
                  isExpanded={expandedCardId === demand._id}
                  onExpand={(cardId) => {
                    // Only one card can be expanded at a time
                    setExpandedCardId(cardId === expandedCardId ? null : cardId);
                  }}
                />
              </div>
              <div className="p-4 border-t border-slate-200 mt-auto">
                <button
                  onClick={() => handleDelete(demand._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

