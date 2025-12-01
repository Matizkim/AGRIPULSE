import React from "react";
import { CheckCircleIcon, MapPinIcon, CurrencyDollarIcon, ScaleIcon, ClockIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function MatchCard({ match }) {
  if (!match) return null;

  // Safely extract data with fallbacks
  const listing = match.listing || match.listingId || {};
  const demand = match.demand || match.demandId || {};
  const status = match.status || "requested";
  const priceAgreed = match.priceAgreed || 0;

  // Status badge colors
  const statusColors = {
    requested: "bg-yellow-100 text-yellow-700",
    offered: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    in_transit: "bg-purple-100 text-purple-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">Match</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || statusColors.requested}`}>
                {status.toUpperCase().replace("_", " ")}
              </span>
              {match.transportBooked && (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
                  <TruckIcon className="w-3 h-3" />
                  Transport
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-green-100 px-4 py-2 rounded-lg">
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Agreed Price</div>
          <div className="text-lg font-bold text-green-700">
            {priceAgreed ? `KES ${priceAgreed.toLocaleString()}` : "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Produce Listing */}
        <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Produce Listing</h4>
          </div>
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-800">
              {listing?.crop || "—"}
            </div>
            {listing?.quantityKg && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ScaleIcon className="w-4 h-4 text-green-600" />
                <span>Qty: {listing.quantityKg} kg</span>
              </div>
            )}
            {listing?.location?.county && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPinIcon className="w-4 h-4 text-green-600" />
                <span>{listing.location.county}</span>
              </div>
            )}
            {listing?.expectedPrice && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                <span>Expected: KES {listing.expectedPrice.toLocaleString()}</span>
              </div>
            )}
            {listing?.farmerId?.name && (
              <div className="text-xs text-slate-500 mt-2">
                Farmer: {listing.farmerId.name}
                {listing.farmerId?.isVerified && (
                  <span className="ml-1 text-green-600">✓ Verified</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Market Demand */}
        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Market Demand</h4>
          </div>
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-800">
              {demand?.crop || "—"}
            </div>
            {demand?.qtyKg && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ScaleIcon className="w-4 h-4 text-emerald-600" />
                <span>Qty needed: {demand.qtyKg} kg</span>
              </div>
            )}
            {demand?.location?.county && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPinIcon className="w-4 h-4 text-emerald-600" />
                <span>{demand.location.county}</span>
              </div>
            )}
            {demand?.priceOffer && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                <span>Offer: KES {demand.priceOffer.toLocaleString()}</span>
              </div>
            )}
            {demand?.urgency && (
              <div className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 inline-block">
                {demand.urgency} urgency
              </div>
            )}
            {demand?.buyerId?.name && (
              <div className="text-xs text-slate-500 mt-2">
                Buyer: {demand.buyerId.name}
                {demand.buyerId?.isVerified && (
                  <span className="ml-1 text-green-600">✓ Verified</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match metadata */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          <span>Created: {new Date(match.createdAt || Date.now()).toLocaleString()}</span>
        </div>
        {match.initiatedBy?.name && (
          <span>Initiated by: {match.initiatedBy.name}</span>
        )}
      </div>
    </div>
  );
}
