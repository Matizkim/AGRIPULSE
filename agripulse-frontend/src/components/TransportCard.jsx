import React, { useState } from "react";
import { MapPinIcon, CurrencyDollarIcon, TruckIcon, ChevronUpIcon, UserIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";
import { ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function TransportCard({ item, onBookTransport, showActions = true }) {
  if (!item) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e) => {
    // Don't expand if clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleBookTransport = (e) => {
    e.stopPropagation();
    if (onBookTransport) onBookTransport(item);
  };

  const driver = item.driverId || item.driver;
  const profilePic = driver?.profilePicture;
  const driverName = driver?.name || "Unknown Driver";
  const isDriverVerified = driver?.isVerified || false;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 group cursor-pointer overflow-hidden"
    >
      {/* Basic Card View */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                {item.vehicleType?.toUpperCase() || "TRANSPORT"}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-800">Capacity: {item.capacityKg} kg</span>
            </div>
          </div>
          <div className="text-right bg-blue-50 px-3 py-2 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Price/Km</div>
            <div className="text-sm font-semibold text-blue-600">
              KES {item.pricePerKm?.toLocaleString() || "0"}
            </div>
          </div>
        </div>
        
        {/* Driver Info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={driverName}
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{driverName}</span>
              {isDriverVerified ? (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckBadgeIconSolid className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  Not Verified
                </span>
              )}
            </div>
            {driver?.rating && (
              <div className="text-xs text-slate-500">⭐ {driver.rating.toFixed(1)}</div>
            )}
          </div>
        </div>
        
        {item.route && (
          <div className="flex items-center gap-1.5 text-slate-600 pt-2">
            <MapPinIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{item.route}</span>
          </div>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
          {/* Driver Details */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Driver Details
            </h4>
            <div className="flex items-center gap-3">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={driverName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{driverName}</span>
                  {isDriverVerified ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold flex items-center gap-1">
                      <CheckBadgeIconSolid className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
                      Not Verified
                    </span>
                  )}
                </div>
                {driver?.rating && (
                  <div className="text-sm text-slate-600 mt-1">⭐ {driver.rating.toFixed(1)} rating</div>
                )}
                {driver?.phone && (
                  <div className="text-sm text-slate-600 mt-1">📞 {driver.phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              Vehicle Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Type:</span>
                <span className="ml-2 font-semibold text-slate-800 capitalize">{item.vehicleType || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500">Capacity:</span>
                <span className="ml-2 font-semibold text-slate-800">{item.capacityKg} kg</span>
              </div>
              {item.vehicleRegistration && (
                <div className="col-span-2">
                  <span className="text-slate-500">Registration:</span>
                  <span className="ml-2 font-semibold text-slate-800">{item.vehicleRegistration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Transport Terms */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3">Transport Terms</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Price per Km:</span>
                <span className="ml-2 font-semibold text-slate-800">KES {item.pricePerKm?.toLocaleString() || "0"}</span>
              </div>
              {item.minimumCharge && (
                <div>
                  <span className="text-slate-500">Minimum Charge:</span>
                  <span className="ml-2 font-semibold text-slate-800">KES {item.minimumCharge.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Route Information */}
          {(item.route || item.origin || item.destination) && (
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-600" />
                Route Information
              </h4>
              <div className="space-y-2 text-sm">
                {item.route && (
                  <div>
                    <span className="text-slate-500">Route:</span>
                    <span className="ml-2 font-semibold text-slate-800">{item.route}</span>
                  </div>
                )}
                {item.origin && (
                  <div>
                    <span className="text-slate-500">Origin:</span>
                    <span className="ml-2 font-semibold text-slate-800">
                      {item.origin.county || ""} {item.origin.town ? `- ${item.origin.town}` : ""}
                    </span>
                  </div>
                )}
                {item.destination && (
                  <div>
                    <span className="text-slate-500">Destination:</span>
                    <span className="ml-2 font-semibold text-slate-800">
                      {item.destination.county || ""} {item.destination.town ? `- ${item.destination.town}` : ""}
                    </span>
                  </div>
                )}
                {item.servesCounties && item.servesCounties.length > 0 && (
                  <div>
                    <span className="text-slate-500">Serves Counties:</span>
                    <span className="ml-2 font-semibold text-slate-800">{item.servesCounties.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              Availability
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Status:</span>
                <span className={`ml-2 font-semibold ${item.status === 'available' ? 'text-green-600' : 'text-slate-600'}`}>
                  {item.status || "Available"}
                </span>
              </div>
              {item.availableFrom && (
                <div>
                  <span className="text-slate-500">Available From:</span>
                  <span className="ml-2 font-semibold text-slate-800">
                    {new Date(item.availableFrom).toLocaleDateString()}
                  </span>
                </div>
              )}
              {item.availableUntil && (
                <div>
                  <span className="text-slate-500">Available Until:</span>
                  <span className="ml-2 font-semibold text-slate-800">
                    {new Date(item.availableUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {showActions && item.status === 'available' && onBookTransport && (
              <button 
                onClick={handleBookTransport}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
              >
                <TruckIcon className="w-5 h-5" />
                Book Transport
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <ChevronUpIcon className="w-5 h-5" />
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

