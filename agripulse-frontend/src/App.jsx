import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProducePage from "./pages/Produce";
import DemandPage from "./pages/Demand";
import MatchesPage from "./pages/Matches";
import SMSPage from "./pages/SMS";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

function Protected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produce" element={<Protected><ProducePage /></Protected>} />
          <Route path="/demand" element={<Protected><DemandPage /></Protected>} />
          <Route path="/matches" element={<Protected><MatchesPage /></Protected>} />
          <Route path="/sms" element={<Protected><SMSPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
