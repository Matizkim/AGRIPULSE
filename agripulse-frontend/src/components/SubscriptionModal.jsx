import React, { useEffect } from "react";
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesIconSolid } from "@heroicons/react/24/solid";

export default function SubscriptionModal({ isOpen, onClose, tierName }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        // Only close on backdrop click, not on modal content
        if (e.target === e.currentTarget) {
          // Optional: Uncomment to allow backdrop click to close
          // onClose();
        }
      }}
    >
      <div 
        className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative border-2 border-amber-200/50"
        style={{
          animation: 'slideUpScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-lg hover:shadow-xl hover:scale-110"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Animated Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 bg-amber-300 rounded-full animate-pulse opacity-50"></div>
              
              {/* Main icon container */}
              <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-full p-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <SparklesIconSolid className="w-16 h-16 text-white animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-2">
                <SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <SparklesIcon className="w-5 h-5 text-orange-400 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {tierName} Coming Soon!
          </h2>
          
          {/* Subtitle */}
          <p className="text-center text-slate-600 mb-6 text-lg">
            Premium Features on the Way
          </p>

          {/* Features List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-amber-100">
            <div className="space-y-3">
              <div className="flex items-start gap-3 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Advanced Payment Processing</p>
                  <p className="text-sm text-slate-600">Secure and seamless transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Priority Support</p>
                  <p className="text-sm text-slate-600">Get help when you need it most</p>
                </div>
              </div>
              <div className="flex items-start gap-3 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Enhanced Features</p>
                  <p className="text-sm text-slate-600">Unlock the full potential of AgriPulse</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-slate-600 mb-6 leading-relaxed">
            We're working hard to bring you <span className="font-bold text-amber-600">{tierName}</span> features. 
            Premium payment processing and advanced features will be available soon!
          </p>

          <p className="text-center text-sm text-slate-500 mb-6">
            You'll be notified as soon as premium features are available for upgrade.
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Got it!</span>
            <CheckCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUpScale {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    </div>
  );
}

