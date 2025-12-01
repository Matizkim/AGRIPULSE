import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, updateUser } from "../api/users";
import { getUserReviews } from "../api/reviews";
import useAuthFetch from "../hooks/useAuthFetch";
import { UserIcon, StarIcon, CheckBadgeIcon, XCircleIcon, ClockIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid, CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Modal from "../components/Modal";
import { useToast } from "../contexts/ToastContext";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTier, setComingSoonTier] = useState("");
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  useEffect(() => {
    loadProfile();
    loadReviews();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      console.log("📥 Loaded user profile:", data);
      console.log("  - Roles:", data.roles);
      console.log("  - Primary Role:", data.primaryRole);
      
      // Ensure roles array exists and is not empty
      const userRoles = data.roles && data.roles.length > 0 
        ? data.roles 
        : [data.primaryRole || "farmer"];
      
      // Ensure primaryRole is in roles
      if (!userRoles.includes(data.primaryRole || "farmer")) {
        userRoles.push(data.primaryRole || "farmer");
      }
      
      setUser(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        primaryRole: data.primaryRole || "farmer",
        roles: userRoles,
        location: data.location || { county: "", town: "" }
      });
      
      console.log("✅ Form initialized with roles:", userRoles);
    } catch(err) {
      console.error("❌ Error loading profile:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      if (user?._id) {
        const data = await getUserReviews(user._id);
        setReviews(data);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // CRITICAL: Only send fields that are explicitly being updated
      // Don't send roles/primaryRole unless they were actually changed by the user
      const payload = {};
      
      // Only include fields that are different from current user data
      if (form.name !== undefined && form.name !== user?.name) {
        payload.name = form.name;
      }
      if (form.phone !== undefined && form.phone !== user?.phone) {
        payload.phone = form.phone;
      }
      // Email is managed by Clerk - don't allow updates
      if (form.profilePicture !== undefined && form.profilePicture !== user?.profilePicture) {
        payload.profilePicture = form.profilePicture;
      }
      if (form.bio !== undefined && form.bio !== user?.bio) {
        payload.bio = form.bio;
      }
      if (form.location !== undefined && JSON.stringify(form.location) !== JSON.stringify(user?.location)) {
        payload.location = form.location;
      }
      
      // Only update role if it changed (single role selection)
      if (form.primaryRole !== undefined && form.primaryRole !== user?.primaryRole) {
        payload.primaryRole = form.primaryRole;
        payload.roles = [form.primaryRole]; // Single role only
        console.log("✅ Role changed, will update:", user?.primaryRole, "->", form.primaryRole);
      } else {
        console.log("  - Role unchanged, skipping update");
      }
      
      // If no changes, don't send update
      if (Object.keys(payload).length === 0) {
        console.log("⚠️ No changes detected, skipping update");
        alert("No changes to save");
        return;
      }
      
      console.log("📤 Sending profile update (only changed fields):", payload);
      
      const updated = await updateUser(payload);
      
      console.log("✅ Profile updated, received:", updated);
      
      // Update both user state and form state with the response
      setUser(updated);
      setForm({
        name: updated.name || "",
        phone: updated.phone || "",
        email: updated.email || "",
        primaryRole: updated.primaryRole || "farmer",
        roles: updated.roles || [updated.primaryRole || "farmer"],
        location: updated.location || { county: "", town: "" }
      });
      setEditing(false);
      showToast("Profile updated successfully!", "success");
      
      // Reload profile to ensure we have latest data
      await loadProfile();
    } catch(err) {
      console.error("❌ Profile update error:", err);
      console.error("❌ Error response:", err.response?.data);
      showToast(err.response?.data?.error || "Failed to update profile", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <p className="text-slate-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
        </div>
        {user.isVerified && user.verificationStatus === "approved" && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
            <CheckBadgeIconSolid className="w-6 h-6" />
            <span className="font-bold text-sm">Verified Account</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Profile Information</h3>
            <button
              onClick={() => {
                if (editing) {
                  // Cancel - reset form to current user data
                  setForm({
                    name: user.name || "",
                    phone: user.phone || "",
                    email: user.email || "",
                    primaryRole: user.primaryRole || "farmer",
                    roles: user.roles || [user.primaryRole || "farmer"],
                    location: user.location || { county: "", town: "" }
                  });
                }
                setEditing(!editing);
              }}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e)=>setForm({...form, name:e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  value={form.email || ""}
                  disabled
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email is managed by your Clerk account</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e)=>setForm({...form, phone:e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">My Role</label>
                <select
                  value={form.primaryRole || ""}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setForm({...form, primaryRole: newRole, roles: [newRole]});
                  }}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                  <option value="driver">Driver</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Select your primary role on the platform. You can change this later.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">County</label>
                <input
                  value={form.location?.county || ""}
                  onChange={(e)=>setForm({...form, location:{...form.location, county:e.target.value}})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-500">Name</div>
                <div className="text-lg font-semibold">{user.name || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Phone</div>
                <div className="text-lg">{user.phone || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-lg">{user.email || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Primary Role</div>
                <div className="text-lg capitalize">{user.primaryRole || "farmer"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">My Roles</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map(role => (
                      <span key={role} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold capitalize">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">No roles assigned</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Location</div>
                <div className="text-lg">{user.location?.county || "Not set"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats & Ratings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Rating & Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-yellow-600">
                  {user.rating ? user.rating.toFixed(1) : "0.0"}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <StarIconSolid
                        key={i}
                        className={`w-5 h-5 ${i <= Math.round(user.rating || 0) ? "text-yellow-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-slate-500">
                    {user.reviewsCount || 0} reviews
                  </div>
                </div>
              </div>
              {user.isVerified && user.verificationStatus === "approved" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-300">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span className="font-semibold">Verified Account</span>
                </div>
              ) : user.verificationStatus === "rejected" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg border border-red-300">
                  <XCircleIcon className="w-5 h-5" />
                  <span className="font-semibold">Verification Rejected</span>
                </div>
              ) : user.verificationStatus === "pending" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-300">
                  <ClockIcon className="w-5 h-5" />
                  <span className="font-semibold">Pending Verification</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 3).map(review => (
                  <div key={review._id} className="border-l-4 border-yellow-400 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(i => (
                          <StarIconSolid
                            key={i}
                            className={`w-4 h-4 ${i <= review.rating ? "text-yellow-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        by {review.reviewer?.name || "Anonymous"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Premium Plans Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Subscription Plan</h3>
              <SparklesIcon className="w-6 h-6 text-amber-600" />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">Current Plan:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold capitalize">
                  {user.tier || "Not Selected"}
                </span>
              </div>
              {user.tier && (
                <p className="text-xs text-slate-500">
                  {user.tier === "basic" 
                    ? "You're on the free plan. Upgrade to unlock premium features!"
                    : `You're subscribed to ${user.tier} tier.`}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  name: "Pro Tier",
                  tier: "pro",
                  price: "KES 500/month",
                  features: ["Boosted visibility", "Priority matching", "Unlimited chats", "Premium badge"],
                  hasPremiumTag: true,
                },
                {
                  name: "Business Tier",
                  tier: "business",
                  price: "KES 2,000/month",
                  features: ["Account manager", "Bulk analytics", "Unlimited boosts", "Team access"],
                  hasPremiumTag: true,
                },
              ].map((plan, idx) => (
                <div
                  key={idx}
                  className={`relative bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border-2 ${
                    user.tier === plan.tier ? "border-green-400" : "border-slate-200"
                  }`}
                >
                  {user.tier === plan.tier && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      Current
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900">{plan.name}</h4>
                    {plan.hasPremiumTag && (
                      <img
                        src="/images/premium.png"
                        alt="Premium"
                        className="w-8 h-8 object-contain opacity-90"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="text-lg font-black text-green-600 mb-2">{plan.price}</div>
                  <ul className="space-y-1 mb-3">
                    {plan.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <CheckCircleIconSolid className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (user.tier === plan.tier) {
                        return; // Already subscribed
                      }
                      setComingSoonTier(plan.name);
                      setShowComingSoon(true);
                    }}
                    disabled={user.tier === plan.tier}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      user.tier === plan.tier
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                    }`}
                  >
                    {user.tier === plan.tier ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>

            {!user.tier && (
              <Link
                to="/plan-selection"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <span>Select Your Plan</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title={`${comingSoonTier} - Coming Soon!`}
      >
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-amber-500 rounded-full p-6 animate-bounce">
                <SparklesIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Plans Coming Soon!</h3>
          <p className="text-slate-600 mb-6">
            We're working hard to bring you {comingSoonTier} features. Premium payment processing and advanced features will be available soon!
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You'll be notified as soon as premium features are available for upgrade.
          </p>
          <button
            onClick={() => setShowComingSoon(false)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all"
          >
            Got it!
          </button>
        </div>
      </Modal>
    </div>
  );
}

