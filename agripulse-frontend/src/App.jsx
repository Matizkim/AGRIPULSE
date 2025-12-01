import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import RoleCheck from "./components/RoleCheck";

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

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
