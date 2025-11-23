import React from "react";
import { MapPinIcon, CurrencyDollarIcon, ScaleIcon } from "@heroicons/react/24/outline";

export default function ProduceCard({ item }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-green-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
              {item.crop}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <ScaleIcon className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-slate-800">{item.quantityKg} kg</span>
            <span className="text-slate-400">available</span>
          </div>
        </div>
        <div className="text-right bg-green-50 px-3 py-2 rounded-lg">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Farmer ID</div>
          <div className="text-sm font-mono text-slate-700 truncate max-w-[120px]">
            {item.farmerId?.substring(0, 12)}...
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPinIcon className="w-4 h-4 text-green-600" />
          <span className="text-sm">{item.location?.county || "Location not specified"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 ml-auto">
          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-slate-800">
            {item.expectedPrice ? `KES ${item.expectedPrice.toLocaleString()}` : "Price negotiable"}
          </span>
        </div>
      </div>
    </div>
  );
}
