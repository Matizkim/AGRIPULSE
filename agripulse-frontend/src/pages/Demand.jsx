import React, { useEffect, useState } from "react";
import { fetchDemands } from "../api/demand";
import DemandCard from "../components/DemandCard";
import useAuthFetch from "../hooks/useAuthFetch";

export default function DemandPage() {
  const [demands, setDemands] = useState([]);
  const [form, setForm] = useState({ crop: "tomatoes", qtyKg: 0, priceOffer: 0, location: { county: "" } });
  const authFetch = useAuthFetch();

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const d = await fetchDemands();
      setDemands(d);
    } catch(err) {
      console.error(err);
      alert("Failed to load demands");
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch.post("/demand", form);
      const created = res.data;
      setDemands(s => [created, ...s]);
      setForm({ crop: "tomatoes", qtyKg: 0, priceOffer: 0, location: { county: "" }});
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create demand");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-4">Market demands</h2>
        <div className="space-y-3">
          {demands.map(d => <DemandCard key={d._id} item={d} />)}
        </div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Post demand</h3>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <label className="text-sm">Crop</label>
              <input value={form.crop} onChange={(e)=>setForm({...form, crop:e.target.value})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">Quantity (Kg)</label>
              <input type="number" value={form.qtyKg} onChange={(e)=>setForm({...form, qtyKg:Number(e.target.value)})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">Price Offer (KES)</label>
              <input type="number" value={form.priceOffer} onChange={(e)=>setForm({...form, priceOffer:Number(e.target.value)})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">County</label>
              <input value={form.location.county} onChange={(e)=>setForm({...form, location:{...form.location, county: e.target.value}})} className="w-full border rounded px-2 py-1"/>
            </div>

            <button className="w-full bg-green-600 text-white py-2 rounded">Post demand</button>
          </form>
        </div>
      </aside>
    </div>
  );
}
