import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "../api/users";
import FeaturesMenu from "./FeaturesMenu";

export default function Header() {
  const { isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (isSignedIn) {
      checkUserStatus();
    }
  }, [isSignedIn]);

  const checkUserStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setIsAdmin(currentUser.roles?.includes("admin") || false);
      setUserRoles(currentUser.roles || []);
    } catch (err) {
      console.error("Error checking user status:", err);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgriPulse
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/produce"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <ShoppingBagIcon className="w-4 h-4" />
              <span>Produce</span>
            </NavLink>
            <NavLink
              to="/demand"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
              <span>Demand</span>
            </NavLink>
            <NavLink
              to="/matches"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <CheckBadgeIcon className="w-4 h-4" />
              <span>Matches</span>
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Messages</span>
            </NavLink>
            <NavLink
              to="/transport"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <TruckIcon className="w-4 h-4" />
              <span>Transport</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </NavLink>
            {userRoles.includes("farmer") && (
              <NavLink
                to="/my-produce"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>My Produce</span>
              </NavLink>
            )}
            {userRoles.includes("buyer") && (
              <NavLink
                to="/my-demands"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <ClipboardDocumentListIcon className="w-4 h-4" />
                <span>My Demands</span>
              </NavLink>
            )}
            {userRoles.includes("driver") && (
              <NavLink
                to="/my-transport"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <TruckIcon className="w-4 h-4" />
                <span>My Transport</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-100 text-purple-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <FeaturesMenu userRoles={userRoles} isAdmin={isAdmin} />
          
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-all">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm font-medium text-slate-700">
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
