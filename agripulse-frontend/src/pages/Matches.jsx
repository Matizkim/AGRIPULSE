import React, { useEffect, useState } from "react";
import useAuthFetch from "../hooks/useAuthFetch";
import { fetchMatches, createMatch, acceptMatch, cancelMatch, completeMatch, assignDriver } from "../api/match";
import { getSuggestedDrivers } from "../api/transport";
import { createReview } from "../api/reviews";
import { useSocket } from "../contexts/SocketContext";
import { getCurrentUser } from "../api/users";
import MatchCard from "../components/MatchCard";
import { CheckBadgeIcon, PlusIcon, ArrowPathIcon, FunnelIcon, TruckIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { useToast } from "../contexts/ToastContext";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ listingId: "", demandId: "", priceAgreed: 0, message: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [myMatchesOnly, setMyMatchesOnly] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();
  
  // Driver selection modal
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [suggestedDrivers, setSuggestedDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  
  // Rating modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingMatch, setRatingMatch] = useState(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  
  const authFetch = useAuthFetch();
  const socket = useSocket();

  useEffect(() => {
    checkAdminStatus();
    load();
  }, [statusFilter, myMatchesOnly]);

  const checkAdminStatus = async () => {
    try {
      const user = await getCurrentUser();
      setIsAdmin(user.roles?.includes("admin") || false);
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  };

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMatch = (match) => {
      console.log("🔔 New match created:", match);
      setMatches(prev => [match, ...prev]);
    };

    const handleMatchAccepted = (match) => {
      console.log("🔔 Match accepted:", match);
      setMatches(prev => prev.map(m => m._id === match._id ? match : m));
    };

    const handleMatchCancelled = (match) => {
      console.log("🔔 Match cancelled:", match);
      setMatches(prev => prev.filter(m => m._id !== match._id));
    };

    const handleMatchDriverAssigned = (match) => {
      console.log("🔔 Driver assigned:", match);
      setMatches(prev => prev.map(m => m._id === match._id ? match : m));
    };

    const handleMatchCompleted = (match) => {
      console.log("🔔 Match completed:", match);
      setMatches(prev => prev.map(m => m._id === match._id ? match : m));
    };

    socket.on("newMatch", handleNewMatch);
    socket.on("matchAccepted", handleMatchAccepted);
    socket.on("matchCancelled", handleMatchCancelled);
    socket.on("matchDriverAssigned", handleMatchDriverAssigned);
    socket.on("matchCompleted", handleMatchCompleted);

    return () => {
      socket.off("newMatch", handleNewMatch);
      socket.off("matchAccepted", handleMatchAccepted);
      socket.off("matchCancelled", handleMatchCancelled);
      socket.off("matchDriverAssigned", handleMatchDriverAssigned);
      socket.off("matchCompleted", handleMatchCompleted);
    };
  }, [socket]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (myMatchesOnly) params.myMatches = "true";
      
      const data = await fetchMatches(params);
      // Handle both array and object response
      setMatches(Array.isArray(data) ? data : (data.matches || []));
    } catch(err) {
      console.error(err);
      showToast("Failed to load matches", "error");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createMatch(form);
      setMatches(s => [created, ...s]);
      setForm({ listingId: "", demandId: "", priceAgreed: 0, message: "" });
      showToast("Match created successfully! ✅", "success");
    } catch(err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create match", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (matchId) => {
    if (!confirm("Accept this match?")) return;
    try {
      const updated = await acceptMatch(matchId);
      setMatches(s => s.map(m => m._id === matchId ? updated : m));
      showToast("Match accepted! ✅", "success");
    } catch(err) {
      showToast(err.response?.data?.error || "Failed to accept match", "error");
    }
  };

  const handleCancel = async (matchId) => {
    if (!confirm("Cancel this match?")) return;
    try {
      await cancelMatch(matchId);
      setMatches(s => s.filter(m => m._id !== matchId));
      showToast("Match cancelled", "info");
    } catch(err) {
      showToast(err.response?.data?.error || "Failed to cancel match", "error");
    }
  };

  const handleComplete = async (matchId) => {
    if (!confirm("Mark this match as completed?")) return;
    try {
      const updated = await completeMatch(matchId);
      setMatches(s => s.map(m => m._id === matchId ? updated : m));
      
      // Show rating modal after completion
      setRatingMatch(updated);
      setShowRatingModal(true);
    } catch(err) {
      showToast(err.response?.data?.error || "Failed to complete match", "error");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!ratingMatch) return;
    
    try {
      await createReview(ratingMatch._id, rating, ratingComment, {
        quality: rating,
        communication: rating,
        timeliness: rating
      });
      
      showToast("Thank you for your review! ⭐", "success");
      setShowRatingModal(false);
      setRating(5);
      setRatingComment("");
      setRatingMatch(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to submit review", "error");
    }
  };

  const [driverMessage, setDriverMessage] = useState("");
  const [regionalDrivers, setRegionalDrivers] = useState([]);
  const [otherDrivers, setOtherDrivers] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);

  const handleSelectDriver = async (match) => {
    setSelectedMatch(match);
    setShowDriverModal(true);
    setLoadingDrivers(true);
    
    try {
      const data = await getSuggestedDrivers(match._id);
      setRegionalDrivers(data.regionalDrivers || []);
      setOtherDrivers(data.otherDrivers || []);
      setDriverMessage(data.message || "");
      setMatchInfo(data.matchInfo || null);
      // Combine for backward compatibility
      setSuggestedDrivers([...data.regionalDrivers || [], ...data.otherDrivers || []]);
    } catch (err) {
      console.error("Failed to load drivers:", err);
      showToast("Could not load suggested drivers", "error");
      setSuggestedDrivers([]);
      setRegionalDrivers([]);
      setOtherDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      const updated = await assignDriver(selectedMatch._id, driverId, {});
      setMatches(s => s.map(m => m._id === selectedMatch._id ? updated : m));
      setShowDriverModal(false);
      showToast("Driver assigned successfully! 🚚", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to assign driver", "error");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Matches</h2>
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

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="requested">Requested</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={myMatchesOnly}
              onChange={(e) => setMyMatchesOnly(e.target.checked)}
              className="rounded"
            />
            My Matches Only
          </label>
        </div>

        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-xl shadow-md text-center">
              <CheckBadgeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No matches found. Create one to get started!</p>
            </div>
          ) : (
            matches.map(m => (
              <div key={m._id} className="relative">
                <MatchCard match={m} />
                {/* Action buttons */}
                {m.status === "requested" || m.status === "offered" ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleAccept(m._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleCancel(m._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : m.status === "accepted" || m.status === "in_transit" ? (
                  <div className="mt-2 flex gap-2">
                    {m.status === "accepted" && !m.driverId && (
                      <button
                        onClick={() => handleSelectDriver(m)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                      >
                        <TruckIcon className="w-4 h-4" />
                        Select Driver
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete(m._id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                    >
                      Mark Complete
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {isAdmin && (
        <aside>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlusIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Create Match</h3>
          </div>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Listing ID</label>
              <input
                value={form.listingId}
                onChange={e=>setForm({...form, listingId:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Enter listing ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Demand ID</label>
              <input
                value={form.demandId}
                onChange={e=>setForm({...form, demandId:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Enter demand ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Agreed (KES)</label>
              <input
                type="number"
                value={form.priceAgreed}
                onChange={e=>setForm({...form, priceAgreed:Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message (Optional)</label>
              <textarea
                value={form.message}
                onChange={e=>setForm({...form, message:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Add a message..."
                rows="3"
              />
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
                  Create Match
                </>
              )}
            </button>
          </form>
        </div>
      </aside>
      )}

      {/* Driver Selection Modal */}
      {showDriverModal && selectedMatch && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowDriverModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-gradient-to-r from-blue-50 to-white z-10">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <TruckIcon className="w-6 h-6 text-blue-600" />
                Select Transport Driver
              </h3>
              <button 
                onClick={() => setShowDriverModal(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingDrivers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Finding available drivers...</p>
                </div>
              ) : suggestedDrivers.length === 0 ? (
                <div className="text-center py-12">
                  <TruckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No drivers found matching your route</p>
                  <button
                    onClick={() => setShowDriverModal(false)}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Route Map Visualization */}
                  {matchInfo && matchInfo.origin && matchInfo.destination && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                      <h4 className="font-bold text-slate-800 mb-3">Route Information</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-700">📍 Origin</div>
                          <div className="text-base text-slate-800">{matchInfo.origin.county}, {matchInfo.origin.town || 'N/A'}</div>
                        </div>
                        <div className="mx-4 text-blue-600 font-bold">→</div>
                        <div className="flex-1 text-right">
                          <div className="text-sm font-semibold text-slate-700">📍 Destination</div>
                          <div className="text-base text-slate-800">{matchInfo.destination.county}, {matchInfo.destination.town || 'N/A'}</div>
                        </div>
                      </div>
                      {matchInfo.requiredCapacity && (
                        <div className="mt-3 text-sm text-slate-600">
                          Required Capacity: <span className="font-semibold">{matchInfo.requiredCapacity} kg</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  {driverMessage && (
                    <div className={`p-3 rounded-lg ${driverMessage.includes('No drivers found') ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                      <p className="text-sm font-medium">{driverMessage}</p>
                    </div>
                  )}

                  {/* Regional Drivers */}
                  {regionalDrivers.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">REGIONAL</span>
                        Drivers in Your Area ({regionalDrivers.length})
                      </h4>
                      <div className="space-y-3">
                        {regionalDrivers.map((transport) => (
                          <div key={transport._id} className="border-2 border-green-300 rounded-xl p-4 hover:border-green-500 transition-all bg-green-50/50">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-bold text-lg text-slate-800">{transport.vehicleType.toUpperCase()}</div>
                                  {transport.driverId?.isVerified && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">✓ Verified</span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-700 font-semibold">
                                  {transport.driverId?.name || 'Unknown Driver'}
                                  {transport.driverId?.rating && (
                                    <span className="ml-2 text-yellow-600">⭐ {transport.driverId.rating.toFixed(1)}</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 mt-1">
                                  Capacity: {transport.capacityKg} kg | Phone: {transport.driverId?.phone || 'N/A'}
                                </div>
                                {transport.driverId?.location?.county && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    📍 {transport.driverId.location.county}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm text-slate-500">Price/Km</div>
                                <div className="text-xl font-bold text-green-600">KES {transport.pricePerKm?.toLocaleString()}</div>
                                {transport.minimumCharge && (
                                  <div className="text-xs text-slate-500">Min: KES {transport.minimumCharge.toLocaleString()}</div>
                                )}
                              </div>
                            </div>
                            {transport.route && (
                              <div className="text-sm text-slate-600 mb-3 bg-white p-2 rounded">📍 Route: {transport.route}</div>
                            )}
                            <button
                              onClick={() => handleAssignDriver(transport.driverId._id)}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                            >
                              Assign This Driver
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Drivers */}
                  {otherDrivers.length > 0 && (
                    <div className={regionalDrivers.length > 0 ? 'mt-6 pt-6 border-t-2 border-slate-200' : ''}>
                      <h4 className="font-bold text-slate-800 mb-3">
                        {regionalDrivers.length > 0 ? 'Other Available Drivers' : 'Available Drivers'} ({otherDrivers.length})
                      </h4>
                      <div className="space-y-3">
                        {otherDrivers.map((transport) => (
                          <div key={transport._id} className="border-2 border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="font-bold text-lg text-slate-800">{transport.vehicleType.toUpperCase()}</div>
                                <div className="text-sm text-slate-700 font-semibold">
                                  {transport.driverId?.name || 'Unknown Driver'}
                                  {transport.driverId?.rating && (
                                    <span className="ml-2 text-yellow-600">⭐ {transport.driverId.rating.toFixed(1)}</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 mt-1">
                                  Capacity: {transport.capacityKg} kg | Phone: {transport.driverId?.phone || 'N/A'}
                                </div>
                                {transport.driverId?.location?.county && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    📍 {transport.driverId.location.county}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm text-slate-500">Price/Km</div>
                                <div className="text-xl font-bold text-blue-600">KES {transport.pricePerKm?.toLocaleString()}</div>
                                {transport.minimumCharge && (
                                  <div className="text-xs text-slate-500">Min: KES {transport.minimumCharge.toLocaleString()}</div>
                                )}
                              </div>
                            </div>
                            {transport.route && (
                              <div className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded">📍 Route: {transport.route}</div>
                            )}
                            <button
                              onClick={() => handleAssignDriver(transport.driverId._id)}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                              Assign This Driver
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingMatch && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowRatingModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-white">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
                Rate This Transaction
              </h3>
              <button 
                onClick={() => setShowRatingModal(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-700">
                  <strong>Match completed!</strong> Please rate your experience.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rating *</label>
                <div className="flex gap-2 justify-center mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-4xl transition-all hover:scale-110"
                    >
                      {star <= rating ? (
                        <span className="text-yellow-500">★</span>
                      ) : (
                        <span className="text-slate-300">☆</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-slate-600">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Very Poor"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-yellow-500 outline-none"
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
