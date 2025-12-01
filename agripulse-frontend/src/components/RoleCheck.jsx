import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getCurrentUser } from "../api/users";
import OnboardingPage from "../pages/Onboarding";
import PlanSelection from "../pages/PlanSelection";

export default function RoleCheck({ children }) {
  const [checkingRole, setCheckingRole] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsPlanSelection, setNeedsPlanSelection] = useState(false);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isSignedIn) {
      checkRole();
    } else {
      setCheckingRole(false);
    }
  }, [isSignedIn]);

  const checkRole = async () => {
    try {
      const user = await getCurrentUser();
      
      // FIRST: Check if user has selected a tier
      // Plan selection happens BEFORE onboarding and BEFORE approval
      if (!user || !user.tier) {
        // No tier - must select plan first (unless already on plan selection page)
        if (location.pathname !== "/plan-selection") {
          if (location.pathname === "/") {
            navigate("/plan-selection");
          } else {
            setNeedsPlanSelection(true);
          }
          setCheckingRole(false);
          return;
        }
        // If already on plan selection, allow it
        setCheckingRole(false);
        return;
      }
      
      // User has tier - check if they need onboarding
      // Onboarding happens AFTER plan selection but BEFORE approval
      if (!user.primaryRole || !user.roles || user.roles.length === 0) {
        // No role - needs onboarding
        setNeedsOnboarding(true);
        setCheckingRole(false);
        return;
      }
      
      if (!user.name || !user.phone || !user.location?.county) {
        // Incomplete profile - needs onboarding
        setNeedsOnboarding(true);
        setCheckingRole(false);
        return;
      }
      
      if (!user.legalDetails?.nationalId || !user.legalDetails?.nationalIdImage) {
        // No legal details - needs onboarding
        setNeedsOnboarding(true);
        setCheckingRole(false);
        return;
      }
      
      // User has tier and completed onboarding - check verification status
      if (user.verificationStatus === "rejected" && location.pathname !== "/onboarding") {
        // Rejected - show verification status page
        navigate("/verification-status");
        setCheckingRole(false);
        return;
      }
      
      if (!user.isVerified || user.verificationStatus !== "approved") {
        // Pending verification - show waiting screen in onboarding
        setNeedsOnboarding(true);
        setCheckingRole(false);
        return;
      }
      
      // User is fully verified and approved - allow access
      setCheckingRole(false);
    } catch (err) {
      console.error("Error checking role:", err);
      // If error fetching user (e.g., 500 error), redirect to plan selection
      // This ensures new users always go through plan selection first
      // Plan selection will handle creating/updating the user
      if (location.pathname !== "/plan-selection") {
        if (location.pathname === "/") {
          navigate("/plan-selection");
        } else {
          setNeedsPlanSelection(true);
        }
      }
      setCheckingRole(false);
    }
  };

  if (checkingRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (needsPlanSelection) {
    return <PlanSelection />;
  }

  if (needsOnboarding) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
}

