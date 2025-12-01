import React, { useState } from "react";
import { MapPinIcon, CurrencyDollarIcon, ScaleIcon, ShoppingCartIcon, ChevronUpIcon, UserIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";

export default function ProduceCard({ item, onBuyNow, showActions = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e) => {
    // Don't expand if clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (onBuyNow) onBuyNow(item);
  };

  const farmer = item.farmerId || item.farmer;
  const profilePic = farmer?.profilePicture;
  const farmerName = farmer?.name || "Unknown Farmer";
  const isFarmerVerified = farmer?.isVerified || false;
  const primaryImage = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-green-300 group cursor-pointer overflow-hidden"
    >
      {/* Hero Image Section */}
      {primaryImage ? (
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
          <img 
            src={primaryImage} 
            alt={item.crop}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`text-xs font-bold ${item.status === 'available' ? 'text-green-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'AVAILABLE'}
            </div>
          </div>
          {item.category && (
            <div className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
              {item.category}
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-64 w-full bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 flex items-center justify-center">
          <PhotoIcon className="w-20 h-20 text-green-300" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`text-xs font-bold ${item.status === 'available' ? 'text-green-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'AVAILABLE'}
            </div>
          </div>
        </div>
      )}

      {/* Basic Card View */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-800 group-hover:text-green-700 transition-colors mb-2">
            {item.crop}
          </h3>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center gap-1.5">
              <ScaleIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-800">{item.quantityKg} kg</span>
            </div>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-800">
                {item.expectedPrice ? `KES ${item.expectedPrice.toLocaleString()}` : "Negotiable"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Farmer Info */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={farmerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-green-200 ring-2 ring-green-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-green-50">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{farmerName}</span>
              {isFarmerVerified ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
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
              {farmer?.rating && (
                <span>⭐ {farmer.rating.toFixed(1)}</span>
              )}
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-green-600" />
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
          {/* Product Images Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <PhotoIcon className="w-6 h-6 text-green-600" />
                Product Gallery
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {item.images.map((img, idx) => (
                  <div key={idx} className="relative group/image overflow-hidden rounded-lg">
                    <img 
                      src={img} 
                      alt={`${item.crop} ${idx + 1}`}
                      className="w-full h-48 object-cover group-hover/image:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-green-600" />
              Seller Information
            </h4>
            <div className="flex items-start gap-4">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={farmerName}
                  className="w-16 h-16 rounded-full object-cover border-3 border-green-200 ring-2 ring-green-50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-green-50">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-slate-800">{farmerName}</span>
                  {isFarmerVerified ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckBadgeIconSolid className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      Not Verified
                    </span>
                  )}
                </div>
                {farmer?.rating && (
                  <div className="text-sm text-slate-600 mb-1">⭐ {farmer.rating.toFixed(1)} rating</div>
                )}
                {farmer?.phone && (
                  <div className="text-sm text-slate-600">📞 {farmer.phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-4">Product Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Variety</div>
                <div className="font-bold text-slate-800">{item.crop}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Category</div>
                <div className="font-bold text-slate-800 capitalize">{item.category || "N/A"}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Quantity Available</div>
                <div className="font-bold text-slate-800">{item.quantityKg} kg</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Price</div>
                <div className="font-bold text-slate-800">
                  {item.expectedPrice ? `KES ${item.expectedPrice.toLocaleString()}` : "Negotiable"}
                </div>
              </div>
              {item.readyDate && (
                <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Ready Date</div>
                  <div className="font-bold text-slate-800">
                    {new Date(item.readyDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                <div className="text-xs text-slate-500 mb-1">Price Negotiable</div>
                <div className="font-bold text-slate-800">
                  {item.isPriceNegotiable ? "Yes - Open to offers" : "No - Fixed price"}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-green-600" />
              Location
            </h4>
            <div className="text-base text-slate-700">
              <div className="font-semibold">{item.location?.county || "N/A"}</div>
              {item.location?.town && <div className="text-slate-500 mt-1">{item.location.town}</div>}
            </div>
          </div>

          {/* Action Button */}
          {showActions && item.status === 'available' && onBuyNow && (
            <button 
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:via-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              Buy Now
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
