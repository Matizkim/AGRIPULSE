import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
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
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckingRef = useRef(false);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    if (isSignedIn && authLoaded) {
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
      // If signed in but auth isn't loaded yet, keep spinner (don't mis-route)
      if (!isSignedIn) {
        setCheckingRole(false);
      }
    }
  }, [isSignedIn, authLoaded, location.pathname]);

  const checkRole = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }
    
    isCheckingRef.current = true;
    
    try {
      // Ensure we actually have a Clerk token before hitting /users/me.
      // Without a token, the backend may map this request to a "dev-session" user,
      // which causes the onboarding loop (new/incomplete user on refresh).
      const token = await getToken();
      if (!token) {
        isCheckingRef.current = false;
        // Retry shortly instead of redirecting to onboarding.
        setTimeout(() => {
          if (!isCheckingRef.current) checkRole();
        }, 200);
        return;
      }

      const user = await getCurrentUser();
      
      // 🔐 Admin shortcut:
      // If this user is an admin, skip the normal onboarding/verification flow
      // so they don't get stuck in the "enter personal details" loop.
      const isAdmin = user?.roles?.includes("admin") || user?.primaryRole === "admin";
      if (isAdmin) {
        setNeedsOnboarding(false);
        setNeedsPlanSelection(false);
        setCheckingRole(false);
        isCheckingRef.current = false;

        // Always send admins to the admin dashboard unless they're already there
        if (!location.pathname.startsWith("/admin")) {
          navigate("/admin", { replace: true });
        }
        return;
      }
      
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
      
      // If we get a 401 here, it's usually because token/auth isn't ready yet.
      // Retry briefly instead of forcing onboarding (prevents redirect loops).
      if (err?.response?.status === 401) {
        isCheckingRef.current = false;
        setTimeout(() => {
          if (!isCheckingRef.current) checkRole();
        }, 300);
        return;
      }

      // For other errors, fall back to onboarding
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

