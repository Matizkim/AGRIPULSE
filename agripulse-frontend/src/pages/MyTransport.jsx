import React, { useEffect, useState } from "react";
import { getDriverTransport } from "../api/transport";
import { fetchMatches } from "../api/match";
import { getCurrentUser } from "../api/users";
import TransportCard from "../components/TransportCard";
import { CheckBadgeIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function MyTransportPage() {
  const [transports, setTransports] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("transports"); // "transports" or "trips"
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?._id) {
      if (activeTab === "transports") {
        loadTransports();
      } else {
        loadTrips();
      }
    }
  }, [user, activeTab]);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const loadTransports = async () => {
    setLoading(true);
    try {
      const data = await getDriverTransport(user._id);
      setTransports(data || []);
    } catch (err) {
      console.error("Error loading transports:", err);
      alert("Failed to load your transport listings");
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await fetchMatches();
      // Filter trips where user is the driver
      const driverTrips = (data || []).filter(match => 
        match.driverId?._id?.toString() === user._id.toString() ||
        match.driverId?.toString() === user._id.toString()
      );
      setTrips(driverTrips);
    } catch (err) {
      console.error("Error loading trips:", err);
      alert("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user.roles?.includes("driver")) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-slate-600">You must be a driver to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Transport</h1>
        <p className="text-slate-600">Manage your transport listings and view your trips.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("transports")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "transports"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <TruckIcon className="w-5 h-5 inline mr-2" />
          My Transport Listings
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "trips"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          My Trips
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : activeTab === "transports" ? (
        transports.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <TruckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">You haven't posted any transport listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-4">
            {transports.map((transport) => (
              <div
                key={transport._id}
                className={expandedCardId === transport._id ? 'sm:col-span-2 lg:col-span-2 xl:col-span-3' : ''}
              >
              <TransportCard 
                key={transport._id} 
                item={transport}
                isExpanded={expandedCardId === transport._id}
                onExpand={(cardId) => {
                  // Only one card can be expanded at a time
                  setExpandedCardId(cardId === expandedCardId ? null : cardId);
                }}
              />
              </div>
            ))}
          </div>
        )
      ) : (
        trips.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <CheckBadgeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">You don't have any trips yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {trip.listingId?.crop || "Unknown"} → {trip.demandId?.crop || "Unknown"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Status: <span className="font-semibold">{trip.status}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trip.status === "completed" ? "bg-green-100 text-green-800" :
                    trip.status === "in_transit" ? "bg-blue-100 text-blue-800" :
                    trip.status === "driver_accepted" ? "bg-blue-100 text-blue-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {trip.status?.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">From:</p>
                    <p className="font-semibold">
                      {trip.listingId?.location?.county || "N/A"}, {trip.listingId?.location?.town || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">To:</p>
                    <p className="font-semibold">
                      {trip.demandId?.location?.county || "N/A"}, {trip.demandId?.location?.town || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Farmer:</p>
                    <p className="font-semibold">{trip.listingId?.farmerId?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Buyer:</p>
                    <p className="font-semibold">{trip.demandId?.buyerId?.name || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

