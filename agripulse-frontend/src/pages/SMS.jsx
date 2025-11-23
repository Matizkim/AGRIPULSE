import React, { useState } from "react";
import useAuthFetch from "../hooks/useAuthFetch";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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
      alert("SMS sent successfully! Result: " + JSON.stringify(res.data.result?.SMSMessageData || res.data));
      setForm({ to: "", message: "" });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      alert(err.response?.data?.error || err.message || "SMS failed");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Send SMS</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Dev Mode</span>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <form onSubmit={onSend} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Recipient Phone Number (E.164 format)
            </label>
            <input
              value={form.to}
              onChange={(e)=>setForm({...form, to:e.target.value})}
              placeholder="+2547XXXXXXXX"
              className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono"
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">Include country code (e.g., +254 for Kenya)</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
            <textarea
              value={form.message}
              onChange={(e)=>setForm({...form, message:e.target.value})}
              className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              rows="6"
              placeholder="Enter your message here..."
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">{form.message.length} characters</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "sending" ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : status === "sent" ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Sent!
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Send SMS
                </>
              )}
            </button>
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              Failed to send SMS. Please check the phone number and try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
