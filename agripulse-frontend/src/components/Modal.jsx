import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after render
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for exit animation before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      >
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white rounded-2xl pointer-events-none opacity-50"></div>
          
          {title && (
            <div className="relative flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className={`relative ${title ? "p-6" : "p-6"}`}>
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
            <div className={`${!title ? 'animate-fade-in-up' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
}


