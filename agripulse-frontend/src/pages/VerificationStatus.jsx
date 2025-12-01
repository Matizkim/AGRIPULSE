import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/users";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function VerificationStatus() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      
      // If user is verified and approved, they can proceed
      if (data.isVerified && data.verificationStatus === "approved") {
        // Keep showing congratulations page
      } else if (data.verificationStatus === "rejected") {
        // Show rejection message
      } else if (data.verificationStatus === "pending") {
        // Still pending, redirect back to waiting screen
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = () => {
    navigate("/");
  };

  const handleRetry = () => {
    navigate("/onboarding");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Approved - Show Congratulations
  if (user?.isVerified && user?.verificationStatus === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full p-6 animate-bounce">
                <CheckCircleIcon className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>

          {/* Confetti Animation Effect */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-green-600 mb-4 animate-pulse">
              🎉 Congratulations! 🎉
            </h1>
            <div className="text-6xl mb-4 animate-bounce">
              ✨
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-green-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Your Account Has Been Verified!
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Great news! Your account verification has been approved by our admin team. 
              You can now access all features of AgriPulse and start connecting with farmers, buyers, and transport providers.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 font-semibold">
              ✅ Verified Account Badge Added to Your Profile<br />
              ✅ Full Access to All Platform Features<br />
              ✅ Can Post Produce, Demands, and Transport<br />
              ✅ Can Participate in Matches and Transactions
              </p>
            </div>
          </div>

          {/* Explore Button */}
          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 animate-pulse"
          >
            <span>Explore AgriPulse</span>
            <ArrowRightIcon className="w-6 h-6" />
          </button>

          <p className="text-sm text-slate-500 mt-6">
            Welcome to the AgriPulse community! 🌾
          </p>
        </div>
      </div>
    );
  }

  // Rejected - Show Sorry Message
  if (user?.verificationStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Rejection Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-300 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-red-500 rounded-full p-6">
                <XCircleIcon className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-red-200">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Verification Rejected
            </h1>
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              We're Sorry
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Unfortunately, your account verification request has been rejected. 
              Please review the reason below and resubmit your information.
            </p>

            {/* Rejection Reason */}
            {user.verificationRejectedReason && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <XCircleIcon className="w-5 h-5" />
                  Rejection Reason:
                </h3>
                <p className="text-red-700 whitespace-pre-wrap">
                  {user.verificationRejectedReason}
                </p>
              </div>
            )}

            {/* Common Reasons */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-slate-700 mb-2">Common reasons for rejection:</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>National ID image is unclear or not readable</li>
                <li>National ID number doesn't match the image</li>
                <li>Missing or incomplete information</li>
                <li>Document is expired or invalid</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              <ArrowPathIcon className="w-6 h-6" />
              <span>Retry Verification</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all"
            >
              <span>Go to Profile</span>
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Need help? Contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Still pending - redirect to onboarding
  return null;
}

