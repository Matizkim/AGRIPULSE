import React, { useState } from "react";
import { MapPinIcon, CurrencyDollarIcon, ScaleIcon, SparklesIcon, ChevronUpIcon, UserIcon, PhotoIcon, ClockIcon, TruckIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";

export default function DemandCard({ item, onOfferSupply, showActions = true }) {
  if (!item) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e) => {
    // Don't expand if clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleOfferSupply = (e) => {
    e.stopPropagation();
    if (onOfferSupply) onOfferSupply(item);
  };

  const urgencyColors = {
    urgent: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white"
  };

  const buyer = item.buyerId || item.buyer;
  const profilePic = buyer?.profilePicture;
  const buyerName = buyer?.name || "Unknown Buyer";
  const isBuyerVerified = buyer?.isVerified || false;
  const primaryImage = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-emerald-300 group cursor-pointer overflow-hidden"
    >
      {/* Hero Image Section */}
      {primaryImage ? (
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
          <img 
            src={primaryImage} 
            alt={item.crop}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`text-xs font-bold ${item.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'OPEN'}
            </div>
          </div>
          {item.urgency && (
            <div className={`absolute top-4 left-4 ${urgencyColors[item.urgency] || urgencyColors.medium} backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold`}>
              {item.urgency.toUpperCase()} NEED
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-64 w-full bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 flex items-center justify-center">
          <PhotoIcon className="w-20 h-20 text-emerald-300" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`text-xs font-bold ${item.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'OPEN'}
            </div>
          </div>
          {item.urgency && (
            <div className={`absolute top-4 left-4 ${urgencyColors[item.urgency] || urgencyColors.medium} backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold`}>
              {item.urgency.toUpperCase()} NEED
            </div>
          )}
        </div>
      )}

      {/* Basic Card View */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-2">
            {item.crop}
          </h3>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center gap-1.5">
              <ScaleIcon className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-slate-800">{item.qtyKg} kg</span>
            </div>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-slate-800">
                {item.priceOffer ? `KES ${item.priceOffer.toLocaleString()}` : "Negotiable"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Buyer Info */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={buyerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 ring-2 ring-emerald-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center ring-2 ring-emerald-50">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{buyerName}</span>
              {isBuyerVerified ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckBadgeIconSolid className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  Not Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {buyer?.rating && (
                <span>⭐ {buyer.rating.toFixed(1)}</span>
              )}
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-emerald-600" />
                <span>{item.location?.county || "Location"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Indicator */}
        <div className="flex items-center justify-center text-slate-400 text-sm font-medium">
          <span>Click to {isExpanded ? 'collapse' : 'view details'}</span>
          <ChevronUpIcon className={`w-4 h-4 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 space-y-5 animate-in slide-in-from-top-2">
          {/* Reference Images Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <PhotoIcon className="w-6 h-6 text-emerald-600" />
                Reference Images
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {item.images.map((img, idx) => (
                  <div key={idx} className="relative group/image overflow-hidden rounded-lg">
                    <img 
                      src={img} 
                      alt={`${item.crop} reference ${idx + 1}`}
                      className="w-full h-48 object-cover group-hover/image:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buyer Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-emerald-600" />
              Buyer Information
            </h4>
            <div className="flex items-start gap-4">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={buyerName}
                  className="w-16 h-16 rounded-full object-cover border-3 border-emerald-200 ring-2 ring-emerald-50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center ring-2 ring-emerald-50">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-slate-800">{buyerName}</span>
                  {isBuyerVerified ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckBadgeIconSolid className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      Not Verified
                    </span>
                  )}
                </div>
                {buyer?.rating && (
                  <div className="text-sm text-slate-600 mb-1">⭐ {buyer.rating.toFixed(1)} rating</div>
                )}
                {buyer?.phone && (
                  <div className="text-sm text-slate-600">📞 {buyer.phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-4">Product Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Crop Needed</div>
                <div className="font-bold text-slate-800">{item.crop}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Category</div>
                <div className="font-bold text-slate-800 capitalize">{item.category || "N/A"}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Quantity Needed</div>
                <div className="font-bold text-slate-800">{item.qtyKg} kg</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Price Offer</div>
                <div className="font-bold text-slate-800">
                  {item.priceOffer ? `KES ${item.priceOffer.toLocaleString()}` : "Negotiable"}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                <div className="text-xs text-slate-500 mb-1">Price Negotiable</div>
                <div className="font-bold text-slate-800">
                  {item.isPriceNegotiable ? "Yes - Open to offers" : "No - Fixed price"}
                </div>
              </div>
            </div>
          </div>

          {/* Logistics & Delivery */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <TruckIcon className="w-6 h-6 text-emerald-600" />
              Logistics & Delivery
            </h4>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Pickup Radius</div>
                <div className="font-bold text-slate-800">
                  {item.preferredPickupRadiusKm || 50} km
                </div>
              </div>
              {item.pickupWindow && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Pickup Window</div>
                  <div className="font-bold text-slate-800">
                    {new Date(item.pickupWindow.start).toLocaleDateString()} - {new Date(item.pickupWindow.end).toLocaleDateString()}
                  </div>
                </div>
              )}
              {item.expiresAt && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Valid Until</div>
                  <div className="font-bold text-slate-800">
                    {new Date(item.expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-emerald-600" />
              Location
            </h4>
            <div className="text-base text-slate-700">
              <div className="font-semibold">{item.location?.county || "N/A"}</div>
              {item.location?.town && <div className="text-slate-500 mt-1">{item.location.town}</div>}
            </div>
          </div>

          {/* Action Button */}
          {showActions && item.status === 'open' && onOfferSupply && (
            <button 
              onClick={handleOfferSupply}
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <SparklesIcon className="w-6 h-6" />
              Offer Supply
            </button>
          )}
          
          {/* Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-full px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
          >
            <ChevronUpIcon className="w-5 h-5" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
