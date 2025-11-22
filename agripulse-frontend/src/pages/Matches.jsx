import React, { useEffect, useState } from "react";
import useAuthFetch from "../hooks/useAuthFetch";
import { fetchMatches } from "../api/match";
import MatchCard from "../components/MatchCard";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({ listingId: "", demandId: "", priceAgreed: 0 });
  const authFetch = useAuthFetch();

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const data = await fetchMatches();
      setMatches(data);
    } catch(err) { console.error(err); }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch.post("/match", form);
      const created = res.data;
      setMatches(s => [created, ...s]);
      setForm({ listingId: "", demandId: "", priceAgreed: 0 });
    } catch(err) {
      console.error(err);
      alert("Failed to create match");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-4">Matches</h2>
        <div className="space-y-3">{matches.map(m => <MatchCard key={m._id} match={m} />)}</div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create match</h3>
          <form onSubmit={onCreate} className="space-y-3">
            <div><label className="text-sm">Listing ID</label><input value={form.listingId} onChange={e=>setForm({...form, listingId:e.target.value})} className="w-full border rounded px-2 py-1"/></div>
            <div><label className="text-sm">Demand ID</label><input value={form.demandId} onChange={e=>setForm({...form, demandId:e.target.value})} className="w-full border rounded px-2 py-1"/></div>
            <div><label className="text-sm">Price Agreed</label><input type="number" value={form.priceAgreed} onChange={e=>setForm({...form, priceAgreed:Number(e.target.value)})} className="w-full border rounded px-2 py-1"/></div>
            <button className="w-full bg-green-600 text-white py-2 rounded">Create match</button>
          </form>
        </div>
      </aside>
    </div>
  );
}
