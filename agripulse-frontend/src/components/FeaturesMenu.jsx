import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesIconSolid } from "@heroicons/react/24/solid";

export default function FeaturesMenu({ userRoles = [], isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const features = [
    { icon: ShoppingBagIcon, label: "Produce", path: "/produce", color: "green" },
    { icon: ClipboardDocumentListIcon, label: "Demand", path: "/demand", color: "emerald" },
    { icon: TruckIcon, label: "Transport", path: "/transport", color: "blue" },
    { icon: CheckBadgeIcon, label: "Matches", path: "/matches", color: "purple" },
    { icon: ChatBubbleLeftRightIcon, label: "Messages", path: "/messages", color: "indigo" },
    { icon: UserIcon, label: "Profile", path: "/profile", color: "slate" },
  ];

  const myFeatures = [
    ...(userRoles.includes("farmer") ? [{ icon: ShoppingBagIcon, label: "My Produce", path: "/my-produce", color: "green" }] : []),
    ...(userRoles.includes("buyer") ? [{ icon: ClipboardDocumentListIcon, label: "My Demands", path: "/my-demands", color: "emerald" }] : []),
    ...(userRoles.includes("driver") ? [{ icon: TruckIcon, label: "My Transport", path: "/my-transport", color: "blue" }] : []),
  ];

  const premiumFeatures = [
    { icon: SparklesIconSolid, label: "Premium Plans", path: "/premium", color: "yellow", badge: "Pro" },
    { icon: ChartBarIcon, label: "Analytics", path: "/analytics", color: "purple", badge: "Pro" },
    { icon: BellIcon, label: "Priority Support", path: "/support", color: "blue", badge: "Premium" },
  ];

  const adminFeatures = isAdmin ? [
    { icon: ShieldCheckIcon, label: "Admin Dashboard", path: "/admin", color: "red" },
  ] : [];

  const allFeatures = [...features, ...myFeatures, ...premiumFeatures, ...adminFeatures];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 group"
        aria-label="Features Menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-slate-700 transition-transform duration-300 rotate-90" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-slate-700 group-hover:text-green-600 transition-colors duration-200" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-16 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl sm:rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-green-600" />
            All Features
          </h3>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          {/* Main Features */}
          <div className="p-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">Main Features</p>
            <div className="space-y-1">
              {features.map((feature, idx) => (
                <NavLink
                  key={feature.path}
                  to={feature.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 group animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <feature.icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${
                    feature.color === 'green' ? 'text-green-600' :
                    feature.color === 'emerald' ? 'text-emerald-600' :
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'purple' ? 'text-purple-600' :
                    feature.color === 'indigo' ? 'text-indigo-600' :
                    'text-slate-600'
                  }`} />
                  <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{feature.label}</span>
                  <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    feature.color === 'green' ? 'bg-green-500' :
                    feature.color === 'emerald' ? 'bg-emerald-500' :
                    feature.color === 'blue' ? 'bg-blue-500' :
                    feature.color === 'purple' ? 'bg-purple-500' :
                    feature.color === 'indigo' ? 'bg-indigo-500' :
                    'bg-slate-500'
                  }`} />
                </NavLink>
              ))}
            </div>
          </div>

          {/* My Features */}
          {myFeatures.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">My Listings</p>
              <div className="space-y-1">
                {myFeatures.map((feature, idx) => (
                  <NavLink
                    key={feature.path}
                    to={feature.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 group animate-fade-in"
                    style={{ animationDelay: `${(features.length + idx) * 50}ms` }}
                  >
                    <feature.icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${
                      feature.color === 'green' ? 'text-green-600' :
                      feature.color === 'emerald' ? 'text-emerald-600' :
                      feature.color === 'blue' ? 'text-blue-600' :
                      'text-slate-600'
                    }`} />
                    <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{feature.label}</span>
                    <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      feature.color === 'green' ? 'bg-green-500' :
                      feature.color === 'emerald' ? 'bg-emerald-500' :
                      feature.color === 'blue' ? 'bg-blue-500' :
                      'bg-slate-500'
                    }`} />
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Premium Features */}
          <div className="p-2 border-t border-slate-100 bg-gradient-to-br from-yellow-50 to-amber-50">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide px-3 py-2 flex items-center gap-2">
              <SparklesIconSolid className="w-4 h-4" />
              Premium Features
            </p>
            <div className="space-y-1">
              {premiumFeatures.map((feature, idx) => (
                <NavLink
                  key={feature.path}
                  to={feature.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-100 transition-all duration-200 group animate-fade-in relative"
                  style={{ animationDelay: `${(features.length + myFeatures.length + idx) * 50}ms` }}
                >
                  <feature.icon className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform duration-200" />
                  <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{feature.label}</span>
                  {feature.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Admin Features */}
          {adminFeatures.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">Admin</p>
              <div className="space-y-1">
                {adminFeatures.map((feature, idx) => (
                  <NavLink
                    key={feature.path}
                    to={feature.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-200 group animate-fade-in"
                    style={{ animationDelay: `${(allFeatures.length - adminFeatures.length + idx) * 50}ms` }}
                  >
                    <feature.icon className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                    <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{feature.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

