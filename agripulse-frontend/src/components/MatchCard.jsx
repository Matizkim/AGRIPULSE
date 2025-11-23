import React from "react";
import { CheckCircleIcon, MapPinIcon, CurrencyDollarIcon, ScaleIcon } from "@heroicons/react/24/outline";

export default function MatchCard({ match }) {
  if (!match) return null;

  const listing = match.listing || {};
  const demand = match.demand || {};

  return (
    <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">Match Created</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {new Date(match.createdAt || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="bg-green-100 px-4 py-2 rounded-lg">
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Agreed Price</div>
          <div className="text-lg font-bold text-green-700">
            {match.priceAgreed ? `KES ${match.priceAgreed.toLocaleString()}` : "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Produce Listing</h4>
          </div>
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-800">{listing.crop || "—"}</div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ScaleIcon className="w-4 h-4 text-green-600" />
              <span>Qty: {listing.quantityKg || "—"} kg</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPinIcon className="w-4 h-4 text-green-600" />
              <span>{listing.location?.county || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
              <span>Expected: {listing.expectedPrice ? `KES ${listing.expectedPrice.toLocaleString()}` : "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Market Demand</h4>
          </div>
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-800">{demand.crop || "—"}</div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ScaleIcon className="w-4 h-4 text-emerald-600" />
              <span>Qty needed: {demand.qtyKg || "—"} kg</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPinIcon className="w-4 h-4 text-emerald-600" />
              <span>{demand.location?.county || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
              <span>Offer: {demand.priceOffer ? `KES ${demand.priceOffer.toLocaleString()}` : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
