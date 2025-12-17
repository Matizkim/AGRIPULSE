import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const icons = {
    success: CheckCircleIconSolid,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
  };

  const colors = {
    success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800",
    error: "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800",
    info: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 text-blue-800",
    warning: "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 text-yellow-800",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
  };

  const shadowColors = {
    success: "shadow-green-200/50",
    error: "shadow-red-200/50",
    info: "shadow-blue-200/50",
    warning: "shadow-yellow-200/50",
  };

  const Icon = icons[type] || icons.success;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 ${
        isVisible && !isExiting 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${colors[type]} border-2 rounded-xl shadow-2xl ${shadowColors[type]} p-4 flex items-start gap-3 backdrop-blur-sm transform transition-all duration-300 hover:scale-105`}>
        <div className={`${iconColors[type]} flex-shrink-0 mt-0.5 animate-bounce`} style={{ animationDuration: '2s' }}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm break-words">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`${iconColors[type]} hover:opacity-70 transition-all flex-shrink-0 hover:scale-110 active:scale-95`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

