import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/users";
import useAuthFetch from "../hooks/useAuthFetch";
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  IdentificationIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending"); // pending, approved, rejected
  const [viewingIdImage, setViewingIdImage] = useState(null); // For modal
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      loadPendingUsers();
    }
  }, [user, filterStatus]);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser.roles?.includes("admin")) {
        alert("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.error("Error checking admin access:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await authFetch.get("/users/pending-verification");
      setPendingUsers(response.data.users || []);
    } catch (err) {
      console.error("Error loading pending users:", err);
      if (err.response?.data?.error) {
        console.error("Error details:", err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId, action, reason = "") => {
    try {
      await authFetch.post(`/users/${userId}/verify`, {
        verificationStatus: action, // "approved" or "rejected"
        verificationRejectedReason: reason
      });

      alert(`User ${action === "approved" ? "approved" : "rejected"} successfully`);
      loadPendingUsers();
    } catch (err) {
      console.error("Error updating verification:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to update verification status";
      alert(errorMessage);
    }
  };

  const filteredUsers = pendingUsers.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.legalDetails?.nationalId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || u.verificationStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    pending: pendingUsers.filter(u => u.verificationStatus === "pending").length,
    approved: pendingUsers.filter(u => u.verificationStatus === "approved").length,
    rejected: pendingUsers.filter(u => u.verificationStatus === "rejected").length,
    total: pendingUsers.length
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user?.roles?.includes("admin")) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-600">Manage user verifications and platform operations</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <ClockIcon className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircleIcon className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or National ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">User Verifications</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{u.name || "No Name"}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.verificationStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : u.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {u.verificationStatus || "pending"}
                      </span>
                      {u.verificationRetryCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          Retry #{u.verificationRetryCount}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><strong>Email:</strong> {u.email || "N/A"}</p>
                      <p><strong>Phone:</strong> {u.phone || "N/A"}</p>
                      <p><strong>Role:</strong> {u.primaryRole || "N/A"}</p>
                      <p><strong>National ID:</strong> {u.legalDetails?.nationalId || "N/A"}</p>
                      {u.location && (
                        <p><strong>Location:</strong> {u.location.town || u.location.county || "N/A"}</p>
                      )}
                      {u.legalDetails?.submittedAt && (
                        <p><strong>Submitted:</strong> {new Date(u.legalDetails.submittedAt).toLocaleString()}</p>
                      )}
                      {u.verificationRejectedReason && (
                        <p className="text-red-600"><strong>Rejection Reason:</strong> {u.verificationRejectedReason}</p>
                      )}
                      {u.verificationRetryCount > 0 && (
                        <p className="text-orange-600"><strong>Resubmission Count:</strong> {u.verificationRetryCount}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {u.legalDetails?.nationalIdImage && (
                      <button
                        onClick={() => setViewingIdImage(u.legalDetails.nationalIdImage)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all flex items-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View ID
                      </button>
                    )}
                    {u.verificationStatus === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            if (window.confirm(`Approve verification for ${u.name || u.email}?`)) {
                              handleVerification(u._id, "approved");
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt("Enter rejection reason (optional):");
                            if (reason !== null) {
                              handleVerification(u._id, "rejected", reason || "");
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center gap-2"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ID Image Modal */}
      {viewingIdImage && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setViewingIdImage(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in transform p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-slate-800">National ID Image</h3>
              <button 
                onClick={() => setViewingIdImage(null)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <img 
              src={viewingIdImage} 
              alt="National ID" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

