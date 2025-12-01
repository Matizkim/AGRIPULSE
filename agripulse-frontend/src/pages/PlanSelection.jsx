import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { updateUser, getCurrentUser } from "../api/users";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import Modal from "../components/Modal";
import { useToast } from "../contexts/ToastContext";

export default function PlanSelection() {
  const [selectedTier, setSelectedTier] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTier, setComingSoonTier] = useState("");
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/");
      return;
    }
    loadUser();
  }, [isSignedIn]);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      
      // If user already has a tier, show it as current plan (don't redirect)
      // User can view their current plan but can't reselect it
      if (data && data.tier) {
        // Stay on page to show current plan
        return;
      }
      
      // If user is already verified and approved, they shouldn't be here
      if (data && data.isVerified && data.verificationStatus === "approved") {
        navigate("/");
        return;
      }
      
      // If no tier, stay on plan selection page (this is correct)
    } catch (err) {
      console.error("Error loading user:", err);
      // Even if there's an error, allow user to select plan
      // This handles the case where user doesn't exist yet or API is down
      // The plan selection will create/update the user
    }
  };

  const handleTierSelect = async (tier) => {
    if (loading) return;
    
    setLoading(true);
    setSelectedTier(tier);
    try {
      const response = await updateUser({ tier });
      console.log("✅ Tier selected successfully:", response);
      
      showToast("Plan selected successfully! Redirecting to onboarding...", "success");
      
      // After selecting tier, proceed to onboarding
      setTimeout(() => {
        navigate("/onboarding");
      }, 1500);
    } catch (err) {
      console.error("❌ Error selecting tier:", err);
      console.error("  - Error response:", err.response?.data);
      console.error("  - Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          "Failed to select plan. Please check your connection and try again.";
      
      showToast(errorMessage, "error", 6000);
      setSelectedTier(""); // Reset selection on error
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Basic",
      tier: "basic",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Post demands & produce",
        "Use chat",
        "Search & view profiles",
        "Basic matching",
      ],
      color: "slate",
      popular: false,
    },
    {
      name: "Pro Tier",
      tier: "pro",
      price: "KES 500/month",
      description: "For serious traders",
      features: [
        "Boosted visibility (top of search)",
        "Priority matching",
        "Unlimited chats",
        "Premium badge next to profile",
      ],
      color: "green",
      popular: true,
      hasPremiumTag: true,
    },
    {
      name: "Business Tier",
      tier: "business",
      price: "KES 2,000/month",
      description: "For businesses and organizations",
      features: [
        "Dedicated account manager",
        "Bulk analytics",
        "Unlimited boosted posts",
        "Team access",
      ],
      color: "amber",
      popular: false,
      hasPremiumTag: true,
    },
  ];

  const imagePath = (filename) => {
    return `/images/${filename}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <SparklesIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {user && user.tier ? "Your Current Plan" : "Choose Your Plan"}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {user && user.tier 
              ? "You are currently subscribed to a plan. You can upgrade or downgrade later when premium features are available."
              : "Select the plan that best fits your needs. You can upgrade or downgrade later."}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${
                plan.popular ? "border-amber-400 lg:scale-105" : "border-slate-200"
              } ${selectedTier === plan.tier ? "ring-4 ring-green-400" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-full text-xs sm:text-sm font-bold z-10">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{plan.name}</h3>
                {plan.hasPremiumTag && (
                  <img
                    src={imagePath("premium.png")}
                    alt="Premium"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-90"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
              
              <div className="text-2xl sm:text-3xl font-black text-green-600 mb-2">{plan.price}</div>
              <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
              
              <ul className="space-y-2 sm:space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircleIconSolid className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {user && user.tier === plan.tier ? (
                // User already has this plan - show as current
                <div className="w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm sm:text-base text-center flex items-center justify-center gap-2">
                  <CheckCircleIconSolid className="w-5 h-5" />
                  <span>Current Plan</span>
                </div>
              ) : (
              <button
                onClick={() => {
                  if (plan.tier === "basic") {
                    if (user && user.tier === "basic") {
                      return; // Already subscribed, do nothing
                    }
                    handleTierSelect("basic");
                  } else {
                    // For pro and business, show coming soon modal
                    setComingSoonTier(plan.name);
                    setShowComingSoon(true);
                  }
                }}
                disabled={loading || (user && user.tier === plan.tier)}
                className={`w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  plan.tier === "basic"
                    ? user && user.tier === "basic"
                      ? "bg-gradient-to-r from-slate-400 to-slate-500 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                } ${loading || (user && user.tier === plan.tier) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading && selectedTier === plan.tier 
                  ? "Processing..." 
                  : user && user.tier === plan.tier 
                    ? "Current Plan" 
                    : plan.tier === "basic"
                      ? "Select Plan"
                      : "Coming Soon"}
              </button>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-slate-700 text-sm">
            <strong>Note:</strong> Pro and Business tiers are coming soon. For now, please select the Basic (Free) plan to continue.
            You can upgrade later once premium features are available.
          </p>
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
            For now, please select the <strong>Basic (Free)</strong> plan to continue using AgriPulse. You'll be able to upgrade once premium features are available.
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

