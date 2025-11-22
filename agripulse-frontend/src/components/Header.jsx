import React from "react";
import { NavLink } from "react-router-dom";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

export default function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-green-700">AgriPulse</div>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <NavLink to="/" className={({ isActive }) => isActive ? "text-green-700" : ""}>Home</NavLink>
            <NavLink to="/produce" className={({ isActive }) => isActive ? "text-green-700" : ""}>Produce</NavLink>
            <NavLink to="/demand" className={({ isActive }) => isActive ? "text-green-700" : ""}>Demand</NavLink>
            <NavLink to="/matches" className={({ isActive }) => isActive ? "text-green-700" : ""}>Matches</NavLink>
            <NavLink to="/sms" className={({ isActive }) => isActive ? "text-green-700" : ""}>SMS</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="px-3 py-1 bg-green-600 text-white rounded">Sign in</button>
            </SignInButton>

            <SignUpButton>
              <button className="px-3 py-1 ml-2 bg-white border rounded">Sign up</button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {isSignedIn && user ? user.fullName || user.firstName || user.identifier : ""}
              </div>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
