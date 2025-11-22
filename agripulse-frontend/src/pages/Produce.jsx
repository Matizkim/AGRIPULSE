import React, { useEffect, useState } from "react";
import { fetchProduce } from "../api/produce";
import ProduceCard from "../components/ProduceCard";
import useAuthFetch from "../hooks/useAuthFetch";

export default function ProducePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ crop: "tomatoes", quantityKg: 0, expectedPrice: 0, location: { county: "" } });
  const authFetch = useAuthFetch();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProduce();
      setListings(data);
    } catch (err) {
      console.error(err);
      alert("Could not load produce listings");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch.post("/produce", form);
      const created = res.data;
      setListings((s) => [created, ...s]);
      setForm({ crop: "tomatoes", quantityKg: 0, expectedPrice: 0, location: { county: "" }});
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Create failed");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produce listings</h2>
        </div>

        <div className="space-y-3">
          {loading ? <div>Loading...</div> : listings.map((p) => <ProduceCard key={p._id} item={p} />)}
        </div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create listing</h3>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <label className="text-sm">Crop</label>
              <input value={form.crop} onChange={(e)=>setForm({...form, crop:e.target.value})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">Quantity (Kg)</label>
              <input type="number" value={form.quantityKg} onChange={(e)=>setForm({...form, quantityKg: Number(e.target.value)})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">Expected price (KES)</label>
              <input type="number" value={form.expectedPrice} onChange={(e)=>setForm({...form, expectedPrice: Number(e.target.value)})} className="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label className="text-sm">County</label>
              <input value={form.location.county} onChange={(e)=>setForm({...form, location:{...form.location, county: e.target.value}})} className="w-full border rounded px-2 py-1"/>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Create</button>
          </form>
        </div>
      </aside>
    </div>
  );    
}
