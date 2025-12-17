import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProducePage from "./pages/Produce";
import DemandPage from "./pages/Demand";
import MatchesPage from "./pages/Matches";
import MessagesPage from "./pages/Messages";
import TransportPage from "./pages/Transport";
import ProfilePage from "./pages/Profile";
import SMSPage from "./pages/SMS";
import OnboardingPage from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import VerificationStatus from "./pages/VerificationStatus";
import MyProduce from "./pages/MyProduce";
import MyDemands from "./pages/MyDemands";
import MyTransport from "./pages/MyTransport";
import Safety from "./pages/Safety";
import Payment from "./pages/Payment";
import ReviewDetail from "./pages/ReviewDetail";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import PlanSelection from "./pages/PlanSelection";
import OnboardingSuccess from "./pages/OnboardingSuccess";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import RoleCheck from "./components/RoleCheck";
import { getCurrentUser } from "./api/users";

function Protected({ children }) {
  return (
    <>
      <SignedIn>
        <RoleCheck>{children}</RoleCheck>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const { isSignedIn } = useUser();
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      // Always hide header/footer for onboarding pages
      if (location.pathname === "/onboarding" || 
          location.pathname === "/plan-selection" || 
          location.pathname === "/onboarding-success") {
        setShowHeaderFooter(false);
        setChecking(false);
        return;
      }

      // Always show header/footer for public pages
      if (location.pathname === "/" || 
          location.pathname === "/safety" || 
          location.pathname === "/faq" || 
          location.pathname === "/terms" || 
          location.pathname === "/contact" ||
          location.pathname.startsWith("/reviews/")) {
        setShowHeaderFooter(true);
        setChecking(false);
        return;
      }

      // For signed-in users, check if they are fully onboarded (approved AND has tier)
      if (isSignedIn) {
        try {
          const user = await getCurrentUser();
          // Show header/footer ONLY if user is approved AND has selected a tier
          if (user && 
              user.isVerified && 
              user.verificationStatus === "approved" && 
              user.tier && 
              user.primaryRole && 
              user.name && 
              user.phone && 
              user.location?.county) {
            setShowHeaderFooter(true);
          } else {
            // User is not fully onboarded - hide header/footer
            setShowHeaderFooter(false);
          }
        } catch (err) {
          // If error (user doesn't exist yet), hide header/footer
          console.error("Error checking user:", err);
          setShowHeaderFooter(false);
        }
      } else {
        setShowHeaderFooter(true);
      }
      setChecking(false);
    };

    checkUserStatus();
  }, [location.pathname, isSignedIn]);

  // Don't render until we've checked
  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 w-full overflow-x-hidden">
      {showHeaderFooter && <Header />}
      <main className={`flex-1 container mx-auto px-4 py-8 w-full max-w-full ${!showHeaderFooter ? 'pt-0' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produce" element={<Protected><ProducePage /></Protected>} />
          <Route path="/demand" element={<Protected><DemandPage /></Protected>} />
          <Route path="/matches" element={<Protected><MatchesPage /></Protected>} />
          <Route path="/messages" element={<Protected><MessagesPage /></Protected>} />
          <Route path="/transport" element={<Protected><TransportPage /></Protected>} />
          <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
          <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
          <Route path="/verification-status" element={<Protected><VerificationStatus /></Protected>} />
          <Route path="/sms" element={<Protected><SMSPage /></Protected>} />
          <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
          <Route path="/my-produce" element={<Protected><MyProduce /></Protected>} />
          <Route path="/my-demands" element={<Protected><MyDemands /></Protected>} />
          <Route path="/my-transport" element={<Protected><MyTransport /></Protected>} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/premium/payment" element={<Protected><Payment /></Protected>} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/plan-selection" element={<Protected><PlanSelection /></Protected>} />
          <Route path="/onboarding-success" element={<Protected><OnboardingSuccess /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
