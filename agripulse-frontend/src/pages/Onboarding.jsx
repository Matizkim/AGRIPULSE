import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { updateUser, getCurrentUser } from "../api/users";
import { UserIcon, CheckCircleIcon, IdentificationIcon, MapPinIcon, PhoneIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import LocationSelector from "../components/LocationSelector";

export default function OnboardingPage() {
  const [step, setStep] = useState(1); // 1: Role, 2: Profile, 3: Legal Details, 4: Waiting, 5: Success Animation
  const [selectedRole, setSelectedRole] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    location: { county: "", subcounty: "", town: "" }
  });
  const [legalDetails, setLegalDetails] = useState({
    nationalId: "",
    nationalIdImage: null,
    nationalIdImagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isResubmission, setIsResubmission] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: clerkUser } = useUser();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    let pollInterval = null;
    
    const initialize = async () => {
      const userData = await loadUser();
      
      // If user is approved, don't start polling - RoleCheck will handle redirect
      if (userData && userData.isVerified && userData.verificationStatus === "approved") {
        return; // Don't poll, RoleCheck will handle it
      }
      
      // Only start polling if user is pending (not approved yet) and we're on onboarding page
      if (userData && userData.verificationStatus === "pending" && !userData.isVerified && location.pathname === "/onboarding") {
        pollInterval = setInterval(async () => {
          try {
            const data = await getCurrentUser();
            // If user gets approved, stop polling - RoleCheck will handle redirect
            if (data.isVerified && data.verificationStatus === "approved") {
              if (pollInterval) clearInterval(pollInterval);
              // Don't navigate here - let RoleCheck handle it
            }
          } catch (err) {
            console.error("Error polling user status:", err);
          }
        }, 5000); // Check every 5 seconds
      }
    };
    
    initialize();
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [navigate, location.pathname]);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      
      // If user is approved (with or without tier), don't set any step
      // Let RoleCheck handle all routing for approved users
      if (data.isVerified && data.verificationStatus === "approved") {
        // Don't interfere - RoleCheck will handle redirect
        return data;
      }
      
      // ALWAYS start from step 1 (role selection) - even for retries
      // Pre-fill available data but start from beginning
      if (data.name) setProfileData(prev => ({...prev, name: data.name}));
      if (data.phone) setProfileData(prev => ({...prev, phone: data.phone}));
      if (data.location) setProfileData(prev => ({...prev, location: data.location}));
      if (data.primaryRole) setSelectedRole(data.primaryRole);
      
      // If user was rejected, always start from step 1 to allow resubmission
      if (data.verificationStatus === "rejected") {
        setStep(1);
        return data;
      }
      
      // If user has everything but is pending (not rejected) - show waiting screen
      // National ID is optional, so we don't require it for waiting screen
      if (data.primaryRole && data.name && data.phone && data.location?.county) {
        if (data.verificationStatus === "pending") {
          setStep(4); // Show waiting for approval
        } else {
          // Start from step 1 for any other status
          setStep(1);
        }
      } else {
        // Always start from step 1 if profile incomplete
        setStep(1);
      }
      
      return data;
    } catch (err) {
      console.error("Error loading user:", err);
      return null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLegalDetails(prev => ({
          ...prev,
          nationalIdImage: reader.result,
          nationalIdImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }
    setStep(2);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.phone || !profileData.location?.county) {
      alert("Please fill in all required profile fields (Name, Phone, and Location)");
      return;
    }
    setStep(3);
  };

  const handleLegalSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }
    if (!profileData.name || !profileData.phone || !profileData.location?.county) {
      alert("Please complete your profile information");
      return;
    }
    // National ID is optional now

    setLoading(true);
    try {
      // Prepare location object - ensure it has required fields
      const locationData = {
        country: profileData.location?.country || "Kenya",
        county: profileData.location?.county || "",
        subcounty: profileData.location?.subcounty || "",
        town: profileData.location?.town || ""
      };
      
      // Combine all updates into a single request to avoid multiple API calls
      const updates = {
        primaryRole: selectedRole,
        roles: [selectedRole],
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        location: locationData,
        legalDetails: {
          ...(legalDetails.nationalId && { nationalId: legalDetails.nationalId.trim() }),
          ...(legalDetails.nationalIdImage && { nationalIdImage: legalDetails.nationalIdImage })
        }
      };
      
      console.log("Submitting registration with:", {
        ...updates,
        legalDetails: {
          ...updates.legalDetails,
          nationalIdImage: updates.legalDetails.nationalIdImage ? "[Image Data]" : "Missing"
        }
      });
      
      await updateUser(updates);
      
      // Check if user is now visible to admin (has all required fields)
      const updatedUser = await getCurrentUser();
      
      // Update user state with latest data (including retry count)
      setUser(updatedUser);
      
      // Check if this is a resubmission (retry)
      const isRetry = updatedUser.verificationRetryCount > 0;
      
      // If user has completed profile (name, phone, location, role), show waiting screen
      // After admin approval, they'll be redirected to plan selection
      if (updatedUser.primaryRole && updatedUser.name && updatedUser.phone && updatedUser.location?.county) {
        // Show waiting screen - user is pending approval
        setStep(4); // Show waiting screen
      } else {
        setStep(4); // Show waiting screen
      }
    } catch (err) {
      console.error("Error completing registration:", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error occurred";
      const errorDetails = err.response?.data?.details;
      
      console.error("Error details:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        details: errorDetails
      });
      
      // Show more detailed error message
      if (errorDetails && Array.isArray(errorDetails)) {
        const fieldErrors = errorDetails.map(d => `${d.field}: ${d.message}`).join("\n");
        alert(`Failed to complete registration:\n${errorMessage}\n\nField errors:\n${fieldErrors}`);
      } else {
        alert(`Failed to complete registration: ${errorMessage}\n\nPlease check the console for more details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "farmer", label: "Farmer", description: "Post produce listings and connect with buyers" },
    { value: "buyer", label: "Buyer", description: "Find produce and create demand listings" },
    { value: "driver", label: "Transport Provider", description: "Offer transport services for deliveries" }
  ];

  // CRITICAL: If user is approved, don't render Onboarding at all - let RoleCheck handle routing
  // This prevents blinking and step resets
  if (user && user.isVerified && user.verificationStatus === "approved") {
    return null; // RoleCheck will handle redirect to plan-selection or role-specific page
  }

  // Step 5: Success Animation (for both first-time and resubmissions)
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full p-6 animate-bounce">
                <CheckCircleIconSolid className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-green-600 mb-4 animate-pulse">
              {isResubmission ? "🎉 Resubmission Successful! 🎉" : "🎉 Registration Successful! 🎉"}
            </h1>
            <div className="text-6xl mb-4 animate-bounce">
              ✨
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-green-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isResubmission ? "Your Application Has Been Resubmitted!" : "Your Registration is Complete!"}
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              {isResubmission 
                ? "Great job! Your application has been successfully resubmitted for review. Our admin team will review your updated documents and verify your account."
                : "Excellent! Your registration has been successfully submitted. Our admin team will review your documents and verify your account."}
            </p>
            <div className={`${isResubmission ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${isResubmission ? 'text-blue-800' : 'text-green-800'} font-semibold`}>
                {isResubmission ? (
                  <>
                    📝 Resubmission Attempt #{user?.verificationRetryCount || 1}<br />
                    ⏳ Your account is now pending admin verification<br />
                    📧 You will receive a notification once verified
                  </>
                ) : (
                  <>
                    ✅ Registration submitted successfully<br />
                    ⏳ Your account is now pending admin verification<br />
                    📧 You will receive a notification once verified
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => {
              setIsResubmission(false);
              setStep(4); // Go to waiting screen
            }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 animate-pulse"
          >
            <span>Continue</span>
            <ArrowRightIcon className="w-6 h-6" />
          </button>

          <p className="text-sm text-slate-500 mt-6">
            {isResubmission ? "Thank you for your patience! 🌾" : "Welcome to the AgriPulse community! 🌾"}
          </p>
        </div>
      </div>
    );
  }

  // Step 4: Waiting for verification
  // BUT: If user is approved, don't show waiting screen - let RoleCheck handle redirect
  if (step === 4) {
    // If user is approved, don't render Onboarding at all - RoleCheck will handle it
    if (user && user.isVerified && user.verificationStatus === "approved") {
      return null; // Let RoleCheck handle routing - don't render anything
    }
    
    const isRetry = user?.verificationRetryCount > 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <CheckCircleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          
          {isRetry ? (
            <>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Resubmission Successful!</h1>
              <p className="text-slate-600 mb-4">
                Your application has been successfully resubmitted for review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-semibold">
                  Resubmission #{user.verificationRetryCount}
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Account Pending Verification</h1>
              <p className="text-slate-600 mb-6">
                Your account is currently pending admin verification. You cannot perform any operations until your account is verified.
              </p>
            </>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>What happens next?</strong><br />
              Our admin team will review your submitted documents and verify your account. You will receive a notification once your account is verified.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Step {step} of 3</span>
            <span className="text-sm text-slate-500">{Math.round((step/3)*100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step/3)*100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to AgriPulse!</h1>
              <p className="text-slate-600">
                {clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.primaryEmailAddress?.emailAddress || "User"}
              </p>
              <p className="text-slate-500 mt-4">Please select your primary role to get started</p>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-6">
              <div className="space-y-3">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === role.value
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1 mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 capitalize">{role.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{role.description}</div>
                    </div>
                    {selectedRole === role.value && (
                      <CheckCircleIcon className="w-6 h-6 text-green-600 ml-2" />
                    )}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={!selectedRole || loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Profile
              </button>
            </form>
          </>
        )}

        {/* Step 2: Profile Information */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Complete Your Profile</h1>
              <p className="text-slate-500">Please provide your basic information</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  placeholder="+254700000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Location *
                </label>
                <LocationSelector
                  value={profileData.location}
                  onChange={(location) => setProfileData({...profileData, location})}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Continue to Verification
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Legal Details */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <IdentificationIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Identity Verification</h1>
              <p className="text-slate-500">Please provide your legal identification for verification</p>
            </div>

            <form onSubmit={handleLegalSubmit} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Your account will be pending admin verification. You cannot perform any operations until your account is verified.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">National ID Number (Optional)</label>
                <input
                  type="text"
                  value={legalDetails.nationalId}
                  onChange={(e) => setLegalDetails({...legalDetails, nationalId: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  placeholder="Enter your National ID number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">National ID Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                {legalDetails.nationalIdImagePreview && (
                  <div className="mt-3">
                    <img 
                      src={legalDetails.nationalIdImagePreview} 
                      alt="ID Preview"
                      className="w-full max-w-md h-48 object-contain border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">Upload a clear image of your National ID card</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
