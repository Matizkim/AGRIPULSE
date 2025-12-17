import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getCurrentUser } from "../api/users";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (isSignedIn) {
      loadUser();
    }
  }, [isSignedIn]);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUserRole(data.primaryRole);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const handleContinue = () => {
    // Redirect to role-specific page
    const roleRoute = userRole === "farmer" ? "/produce" 
                    : userRole === "buyer" ? "/demand"
                    : userRole === "driver" ? "/transport"
                    : "/";
    navigate(roleRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse opacity-50"></div>
            
            {/* Main icon container */}
            <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full p-8 shadow-2xl">
              <CheckCircleIcon className="w-24 h-24 text-white" />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2">
              <SparklesIcon className="w-8 h-8 text-green-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <SparklesIcon className="w-6 h-6 text-emerald-400 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Welcome to AgriPulse!
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-700 mb-2 font-semibold">
          Your account is all set up
        </p>
        
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          You've successfully completed your profile and selected your plan. You can now access all features of AgriPulse!
        </p>

        {/* Features List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border-2 border-green-200 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Post produce & demands</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Connect with farmers & buyers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Find transport services</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-slate-700 font-medium">Secure messaging & matches</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

