import React, { useState, useRef, useEffect } from "react";
import { MapPinIcon, CurrencyDollarIcon, TruckIcon, ChevronUpIcon, UserIcon, CheckBadgeIcon, PhotoIcon, EyeIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";
import { ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { incrementTransportViews } from "../api/transport";

export default function TransportCard({ item, onBookTransport, showActions = true, isExpanded: isExpandedProp, onExpand }) {
  if (!item) return null;

  const cardRef = useRef(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Use controlled or uncontrolled state
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  
  const handleExpand = (expanded) => {
    if (onExpand) {
      onExpand(expanded ? item._id : null);
    } else {
      setInternalExpanded(expanded);
    }
  };

  // Scroll card into view when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      // Use setTimeout to ensure DOM has updated with expanded content
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isExpanded]);

  const handleCardClick = async (e) => {
    // Don't expand if clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    const wasExpanded = isExpanded;
    handleExpand(!isExpanded);
    
    // Increment views when expanding (not when collapsing)
    if (!wasExpanded && item._id) {
      await incrementTransportViews(item._id);
    }
  };

  const handleBookTransport = (e) => {
    e.stopPropagation();
    if (onBookTransport) onBookTransport(item);
  };

  const driver = item.driverId || item.driver;
  const profilePic = driver?.profilePicture;
  const driverName = driver?.name || "Unknown Driver";
  const isDriverVerified = driver?.isVerified || false;
  const vehicleImage = item.vehicleImage;

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-300 group cursor-pointer overflow-hidden ${isExpanded ? 'md:col-span-full' : ''}`}
    >
      {/* Hero Image Section */}
      {vehicleImage ? (
        <div className="relative h-32 md:h-36 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
          <img 
            src={vehicleImage} 
            alt={item.vehicleType || "Vehicle"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full">
            <div className={`text-[10px] md:text-xs font-bold ${item.status === 'available' ? 'text-blue-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'AVAILABLE'}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-32 md:h-36 w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-100 flex items-center justify-center">
          <TruckIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-300" />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full">
            <div className={`text-[10px] md:text-xs font-bold ${item.status === 'available' ? 'text-blue-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'AVAILABLE'}
            </div>
          </div>
        </div>
      )}

      {/* Basic Card View */}
      <div className="p-3 md:p-4">
        <div className="mb-2 md:mb-3">
          <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-1 md:mb-1.5 line-clamp-1">
            {item.vehicleType ? item.vehicleType.charAt(0).toUpperCase() + item.vehicleType.slice(1) : "Transport"}
          </h3>
          <div className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <TruckIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">{item.capacityKg} kg</span>
            </div>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
              <span className="font-semibold text-slate-800 text-xs">
                KES {item.pricePerKm?.toLocaleString() || "0"}/km
              </span>
            </div>
          </div>
        </div>
        
        {/* Driver Info */}
        <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3 pb-2 md:pb-3 border-b border-slate-100">
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={driverName}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-blue-200 ring-1 ring-blue-50"
            />
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-1 ring-blue-50">
              <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs md:text-sm text-slate-800 truncate">{driverName}</span>
              {isDriverVerified ? (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-0.5 flex-shrink-0">
                  <CheckBadgeIconSolid className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0">
                  <span className="hidden sm:inline">Not Verified</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-600">
              {driver?.rating && (
                <span>⭐ {driver.rating.toFixed(1)}</span>
              )}
              {driver?.rating && <span className="text-slate-400">•</span>}
              <div className="flex items-center gap-0.5 truncate">
                <MapPinIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">{item.route || item.origin?.county || "Location"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Indicator & Impressions */}
        <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <EyeIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="font-semibold text-slate-600">{item.views || 0} views</span>
          </div>
          <div className="flex items-center font-medium">
            <span className="hidden sm:inline">Click to {isExpanded ? 'collapse' : 'view details'}</span>
            <span className="sm:hidden">{isExpanded ? 'Less' : 'More'}</span>
            <ChevronUpIcon className={`w-3 h-3 md:w-3.5 md:h-3.5 ml-0.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 md:p-4 space-y-3 md:space-y-4 animate-in slide-in-from-top-2">
          {/* Vehicle Image Gallery */}
          {vehicleImage && (
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <PhotoIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span>Vehicle Image</span>
              </h4>
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={vehicleImage} 
                  alt={`${item.vehicleType} vehicle`}
                  className="w-full h-48 md:h-64 object-cover group-hover/image:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          )}
          {/* Driver Details & Vehicle Info - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Vehicle Details */}
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3">Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Type</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800 capitalize truncate">{item.vehicleType || "N/A"}</div>
                </div>
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Capacity</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800">{item.capacityKg} kg</div>
                </div>
                {item.vehicleRegistration && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg col-span-2">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Registration</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800">{item.vehicleRegistration}</div>
                  </div>
                )}
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Price/Km</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800">KES {item.pricePerKm?.toLocaleString() || "0"}</div>
                </div>
                {item.minimumCharge && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Min Charge</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800">KES {item.minimumCharge.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Details */}
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span>Driver Info</span>
              </h4>
              <div className="flex items-start gap-2 md:gap-3">
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt={driverName}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-200 ring-1 ring-blue-50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-1 ring-blue-50 flex-shrink-0">
                    <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-bold text-xs md:text-sm text-slate-800 truncate">{driverName}</span>
                    {isDriverVerified ? (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-0.5 flex-shrink-0">
                        <CheckBadgeIconSolid className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Verified</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0">
                        <span className="hidden sm:inline">Not Verified</span>
                      </span>
                    )}
                  </div>
                  {driver?.rating && (
                    <div className="text-[10px] md:text-xs text-slate-600 mb-0.5">⭐ {driver.rating.toFixed(1)} rating</div>
                  )}
                  {driver?.phone && (
                    <div className="text-[10px] md:text-xs text-slate-600 truncate">📞 {driver.phone}</div>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-slate-600">
                    <MapPinIcon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{item.route || item.origin?.county || "N/A"}</span>
                    {item.origin?.town && <span className="text-slate-400">• {item.origin.town}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          {(item.route || item.origin || item.destination) && (
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span>Route Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                {item.route && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg col-span-2">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Route</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800">{item.route}</div>
                  </div>
                )}
                {item.origin && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Origin</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800 truncate">
                      {item.origin.county || ""} {item.origin.town ? `- ${item.origin.town}` : ""}
                    </div>
                  </div>
                )}
                {item.destination && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Destination</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800 truncate">
                      {item.destination.county || ""} {item.destination.town ? `- ${item.destination.town}` : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          {showActions && item.status === 'available' && onBookTransport && (
            <button 
              onClick={handleBookTransport}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <TruckIcon className="w-4 h-4 md:w-5 md:h-5" />
              Book Transport
            </button>
          )}
          
          {/* Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExpand(false);
            }}
            className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg md:rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 md:gap-2"
          >
            <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}

