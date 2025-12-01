import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import useAuthFetch from "../hooks/useAuthFetch";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const authFetch = useAuthFetch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // In a real app, this would send to your backend
    // For now, we'll create a mailto link
    const mailtoLink = `mailto:kinyuam047@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Contact Us</h1>
        <p className="text-xl text-slate-600">Get in touch with the AgriPulse team</p>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <PhoneIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                  <a href="tel:+254708244593" className="text-green-600 hover:text-green-700">
                    +254 708 244 593
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                  <a href="mailto:kinyuam047@gmail.com" className="text-blue-600 hover:text-blue-700">
                    kinyuam047@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Address</h3>
                  <p className="text-slate-600">62000, Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="font-bold text-slate-900 mb-3">Business Hours</h3>
            <p className="text-slate-700 text-sm mb-2">Monday - Friday: 8:00 AM - 6:00 PM</p>
            <p className="text-slate-700 text-sm mb-2">Saturday: 9:00 AM - 4:00 PM</p>
            <p className="text-slate-700 text-sm">Sunday: Closed</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
          
          {sent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">Message sent! We'll get back to you soon.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Tell us what you need..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <PaperAirplaneIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

