import React from "react";

export default function ProduceCard({ item }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">{item.crop}</div>
          <div className="text-sm text-slate-500">Qty: {item.quantityKg} kg</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Farmer</div>
          <div className="text-sm text-slate-700">{item.farmerId}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600">
        {item.location?.county ? item.location.county : "—"} • Expected price: {item.expectedPrice ?? "N/A"}
      </div>
    </div>
  );
}
