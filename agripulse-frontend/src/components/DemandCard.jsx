import React from "react";
import { MapPinIcon, CurrencyDollarIcon, ScaleIcon } from "@heroicons/react/24/outline";

export default function DemandCard({ item }) {
  if (!item) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-emerald-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
              {item.crop}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <ScaleIcon className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">{item.qtyKg} kg</span>
            <span className="text-slate-400">needed</span>
          </div>
        </div>
        <div className="text-right bg-emerald-50 px-3 py-2 rounded-lg">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Buyer ID</div>
          <div className="text-sm font-mono text-slate-700 truncate max-w-[120px]">
            {item.buyerId?.substring(0, 12)}...
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPinIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-sm">{item.location?.county || "Location not specified"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 ml-auto">
          <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-800">
            {item.priceOffer ? `KES ${item.priceOffer.toLocaleString()}` : "Price negotiable"}
          </span>
        </div>
      </div>
    </div>
  );
}
