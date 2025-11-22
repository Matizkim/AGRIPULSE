import React from "react";

export default function DemandCard({ item }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between">
        <div>
          <div className="text-lg font-semibold">{item.crop}</div>
          <div className="text-sm text-slate-500">Qty needed: {item.qtyKg} kg</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Offer: {item.priceOffer ?? "N/A"}</div>
        </div>
      </div>
      <div className="mt-2 text-sm text-slate-600">
        {item.location?.county ?? "—"} • Posted: {new Date(item.postedAt ?? item.createdAt ?? Date.now()).toLocaleString()}
      </div>
    </div>
  );
}
