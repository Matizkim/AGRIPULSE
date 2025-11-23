import React, { useEffect, useState } from "react";
import useAuthFetch from "../hooks/useAuthFetch";
import { fetchMatches } from "../api/match";
import MatchCard from "../components/MatchCard";
import { CheckBadgeIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ listingId: "", demandId: "", priceAgreed: 0 });
  const authFetch = useAuthFetch();

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMatches();
      setMatches(data);
    } catch(err) {
      console.error(err);
      alert("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch.post("/match", form);
      const created = res.data;
      setMatches(s => [created, ...s]);
      setForm({ listingId: "", demandId: "", priceAgreed: 0 });
      alert("Match created successfully!");
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create match");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Matches</h2>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <CheckBadgeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No matches yet. Create one to get started!</p>
            </div>
          ) : (
            matches.map(m => <MatchCard key={m._id} match={m} />)
          )}
        </div>
      </div>

      <aside>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlusIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Create Match</h3>
          </div>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Listing ID</label>
              <input
                value={form.listingId}
                onChange={e=>setForm({...form, listingId:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Enter listing ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Demand ID</label>
              <input
                value={form.demandId}
                onChange={e=>setForm({...form, demandId:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Enter demand ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Agreed (KES)</label>
              <input
                type="number"
                value={form.priceAgreed}
                onChange={e=>setForm({...form, priceAgreed:Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Create Match
                </>
              )}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
