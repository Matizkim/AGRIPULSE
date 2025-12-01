import React, { useEffect, useState } from "react";
import { fetchTransport, createTransport } from "../api/transport";
import useAuthFetch from "../hooks/useAuthFetch";
import TransportCard from "../components/TransportCard";
import { TruckIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import routesData from "../data/routes.json";
import { useToast } from "../contexts/ToastContext";

export default function TransportPage() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    vehicleType: "truck",
    vehicleRegistration: "",
    capacityKg: 0,
    route: "",
    selectedRoute: "",
    origin: { county: "", town: "" },
    destination: { county: "", town: "" },
    pricePerKm: 0,
    minimumCharge: 0,
    vehicleImage: null
  });
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);
  
  const handleRouteSelect = (routeName) => {
    const route = routesData.routes.find(r => r.name === routeName);
    if (route) {
      setForm({
        ...form,
        selectedRoute: routeName,
        route: routeName,
        origin: route.origin,
        destination: route.destination
      });
    }
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImagePreview(reader.result);
        setForm({...form, vehicleImage: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };
  const authFetch = useAuthFetch();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTransport();
      if (data.transports) {
        setTransports(data.transports);
      } else {
        setTransports(Array.isArray(data) ? data : []);
      }
    } catch(err) {
      console.error(err);
      showToast("Failed to load transport", "error");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    
    // Validate vehicle image
    if (!form.vehicleImage) {
      showToast("Please upload a picture of your vehicle", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const created = await createTransport(form);
      setTransports(s => [created, ...s]);
      setForm({
        vehicleType: "truck",
        vehicleRegistration: "",
        capacityKg: 0,
        route: "",
        selectedRoute: "",
        origin: { county: "", town: "" },
        destination: { county: "", town: "" },
        pricePerKm: 0,
        minimumCharge: 0,
        vehicleImage: null
      });
      setVehicleImagePreview(null);
      showToast("Transport availability posted successfully! 🎉", "success");
    } catch(err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create transport", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Transport Pool</h2>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : transports.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <TruckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No transport available. Post one to get started!</p>
            </div>
          ) : (
            transports.map(t => (
              <TransportCard key={t._id} item={t} />
            ))
          )}
        </div>
      </div>

      <aside>
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlusIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Post Transport</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={onCreate} className="p-6 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehicle Type *</label>
              <select
                value={form.vehicleType}
                onChange={(e)=>setForm({...form, vehicleType:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity (Kg) *</label>
              <input
                type="number"
                value={form.capacityKg || ""}
                onChange={(e)=>setForm({...form, capacityKg: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Route *</label>
              <select
                value={form.selectedRoute}
                onChange={(e) => handleRouteSelect(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              >
                <option value="">-- Select a route --</option>
                {routesData.routes.map((route, idx) => (
                  <option key={idx} value={route.name}>
                    {route.name} ({route.distance} km)
                  </option>
                ))}
              </select>
              {form.selectedRoute && (
                <div className="mt-2 text-xs text-slate-600 bg-blue-50 p-2 rounded">
                  <div>Origin: {form.origin.county}, {form.origin.town}</div>
                  <div>Destination: {form.destination.county}, {form.destination.town}</div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Custom Route (Optional)</label>
              <input
                value={form.route}
                onChange={(e)=>setForm({...form, route:e.target.value})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Or enter custom route"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price per Km (KES) *</label>
              <input
                type="number"
                value={form.pricePerKm || ""}
                onChange={(e)=>setForm({...form, pricePerKm: e.target.value === "" ? "" : Number(e.target.value)})}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
                min="0"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? "Posting..." : "Post Transport"}
            </button>
          </form>
          </div>
        </div>
      </aside>
    </div>
  );
}