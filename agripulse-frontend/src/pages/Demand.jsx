import React, { useEffect, useState } from "react";
import { fetchDemands } from "../api/demand";
import DemandCard from "../components/DemandCard";
import useAuthFetch from "../hooks/useAuthFetch";
import { ClipboardDocumentListIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function DemandPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ crop: "tomatoes", qtyKg: 0, priceOffer: 0, location: { county: "" } });
  const authFetch = useAuthFetch();

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchDemands();
      setDemands(d);
    } catch(err) {
      console.error(err);
      alert("Failed to load demands");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch.post("/demand", form);
      const created = res.data;
      setDemands(s => [created, ...s]);
      setForm({ crop: "tomatoes", qtyKg: 0, priceOffer: 0, location: { county: "" }});
      alert("Demand posted successfully!");
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create demand");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Market Demands</h2>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : demands.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No market demands yet. Post one to get started!</p>
            </div>
          ) : (
            demands.map(d => <DemandCard key={d._id} item={d} />)
          )}
        </div>
      </div>

      <aside>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <PlusIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Post Demand</h3>
          </div>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Crop Type</label>
              <input
                value={form.crop}
                onChange={(e)=>setForm({...form, crop:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="e.g., tomatoes, maize"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity Needed (Kg)</label>
              <input
                type="number"
                value={form.qtyKg}
                onChange={(e)=>setForm({...form, qtyKg:Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Offer (KES)</label>
              <input
                type="number"
                value={form.priceOffer}
                onChange={(e)=>setForm({...form, priceOffer:Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">County</label>
              <input
                value={form.location.county}
                onChange={(e)=>setForm({...form, location:{...form.location, county: e.target.value}})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="e.g., Nairobi, Nakuru"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Post Demand
                </>
              )}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
