import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { getCurrentUser } from "../api/users";
import OnboardingPage from "../pages/Onboarding";
import PlanSelection from "../pages/PlanSelection";
import OnboardingSuccess from "../pages/OnboardingSuccess";

export default function RoleCheck({ children }) {
  const [checkingRole, setCheckingRole] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsPlanSelection, setNeedsPlanSelection] = useState(false);
  const [needsSuccess, setNeedsSuccess] = useState(false);
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckingRef = useRef(false);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    if (isSignedIn) {
      // Always check on mount or when path changes
      if (location.pathname !== lastPathRef.current || !isCheckingRef.current) {
        lastPathRef.current = location.pathname;
        // Small delay to prevent rapid-fire checks during navigation
        const timer = setTimeout(() => {
          if (!isCheckingRef.current) {
            checkRole();
          }
        }, 10); // Reduced delay for faster redirect
        return () => clearTimeout(timer);
      }
    } else {
      setCheckingRole(false);
    }
  }, [isSignedIn, location.pathname]);

  const checkRole = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }
    
    isCheckingRef.current = true;
    
    try {
      const user = await getCurrentUser();
      
      // NEW FLOW: Details → Approval → Plan Selection → Success → Full Access
      
      // Define allowed pages during onboarding process
      const allowedPages = ["/", "/onboarding", "/plan-selection", "/onboarding-success"];
      const isAllowedPage = allowedPages.includes(location.pathname);
      
      // Handle rejected users first - allow them to resubmit
      if (user.verificationStatus === "rejected") {
        if (!isAllowedPage) {
          navigate("/onboarding", { replace: true });
        }
        setNeedsOnboarding(true);
        setNeedsPlanSelection(false);
        setCheckingRole(false);
        isCheckingRef.current = false;
        return;
      }
      
      // STEP 1: Check if user has filled personal details (onboarding)
      if (!user.primaryRole || !user.roles || user.roles.length === 0 || 
          !user.name || !user.phone || !user.location?.county) {
        // Incomplete profile - needs onboarding (fill details first)
        // Always redirect to onboarding, even from home page
        if (location.pathname !== "/onboarding") {
          navigate("/onboarding", { replace: true });
        }
        setNeedsOnboarding(true);
        setNeedsPlanSelection(false);
        setCheckingRole(false);
        isCheckingRef.current = false;
        return;
      }
      
      // STEP 2: Check if user is approved
      if (!user.isVerified || user.verificationStatus !== "approved") {
        // Not approved yet - show waiting screen in onboarding
        // Always redirect to onboarding, even from home page
        if (location.pathname !== "/onboarding" && location.pathname !== "/plan-selection") {
          navigate("/onboarding", { replace: true });
        }
        // Only show onboarding if we're not already on plan-selection
        if (location.pathname !== "/plan-selection") {
          setNeedsOnboarding(true);
        }
        // Clear plan selection flag to prevent conflicts
        setNeedsPlanSelection(false);
        setCheckingRole(false);
        isCheckingRef.current = false;
        return;
      }
      
      // User is approved - clear onboarding flag immediately
      setNeedsOnboarding(false);
      
      // STEP 3: User is approved - check if they have selected a plan
      if (!user || !user.tier) {
        // No tier - must select plan after approval
        // IMPORTANT: Clear needsOnboarding to prevent Onboarding from rendering
        setNeedsOnboarding(false);
        
        // Only redirect if we're NOT already on plan-selection
        // This prevents redirect loops
        if (location.pathname !== "/plan-selection") {
          navigate("/plan-selection", { replace: true });
        }
        
        // Set plan selection flag (whether we redirected or not)
        setNeedsPlanSelection(true);
        setCheckingRole(false);
        isCheckingRef.current = false;
        return;
      }
      
      // STEP 4: User has tier and is approved - fully onboarded
      // Clear all onboarding flags
      setNeedsOnboarding(false);
      setNeedsPlanSelection(false);
      
      // If they're on onboarding/plan-selection pages, redirect to role-specific page
      if (location.pathname === "/onboarding" || location.pathname === "/plan-selection") {
        // Redirect to role-specific page
        const roleRoute = user.primaryRole === "farmer" ? "/produce" 
                        : user.primaryRole === "buyer" ? "/demand"
                        : user.primaryRole === "driver" ? "/transport"
                        : "/";
        navigate(roleRoute, { replace: true });
      }
      
      // User is fully verified, approved, and has selected plan - allow access
      setCheckingRole(false);
      isCheckingRef.current = false;
    } catch (err) {
      console.error("Error checking role:", err);
      
      // If error fetching user (e.g., user doesn't exist yet, 404, or 500 error)
      // This handles Clerk sign-in for users who haven't signed up yet
      // Always redirect to onboarding, even from home page
      if (location.pathname !== "/onboarding") {
        navigate("/onboarding", { replace: true });
      }
      setNeedsOnboarding(true);
      setNeedsPlanSelection(false);
      setCheckingRole(false);
      isCheckingRef.current = false;
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

  if (needsSuccess) {
    return <OnboardingSuccess />;
  }

  return <>{children}</>;
}

