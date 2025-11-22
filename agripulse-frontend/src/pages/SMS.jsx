import React, { useState } from "react";
import useAuthFetch from "../hooks/useAuthFetch";

export default function SMSPage() {
  const [form, setForm] = useState({ to: "", message: "" });
  const [status, setStatus] = useState(null);
  const authFetch = useAuthFetch();

  const onSend = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await authFetch.post("/sms/send", form);
      setStatus("sent");
      alert("SMS result: " + JSON.stringify(res.data.result?.SMSMessageData || res.data));
      setForm({ to: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
      alert(err.response?.data?.error || err.message || "SMS failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Send test SMS (dev)</h2>
        <form onSubmit={onSend} className="mt-3 space-y-3">
          <div>
            <label className="text-sm">To (E.164)</label>
            <input value={form.to} onChange={(e)=>setForm({...form, to:e.target.value})} placeholder="+2547XXXXXXXX" className="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label className="text-sm">Message</label>
            <textarea value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} className="w-full border rounded px-2 py-1" rows="4"/>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded" disabled={status==="sending"}>{status==="sending" ? "Sending..." : "Send SMS"}</button>
        </form>
      </div>
    </div>
  );
}
