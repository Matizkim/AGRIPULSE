import React from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BellIcon,
  TruckIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-yellow-300">AgriPulse</span>
          </h1>
          <p className="text-xl text-green-50 mb-6 text-lg">
            Fast market matching for farmers and buyers. Post what you have, or post what you need — get notified in real-time.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/produce"
              className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold shadow-lg hover:bg-green-50 transition-all flex items-center gap-2"
            >
              Post Produce
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/demand"
              className="px-6 py-3 bg-green-800/50 text-white border-2 border-white rounded-lg font-semibold hover:bg-green-800 transition-all flex items-center gap-2"
            >
              Post Demand
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">How it works</h3>
              <ol className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">1.</span>
                  <span>Farmers post produce listings with details and pricing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">2.</span>
                  <span>Buyers post demands for specific crops and quantities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">3.</span>
                  <span>Matches are proposed and confirmed; drivers can join transport pools.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Get started</h3>
              <p className="text-slate-600 mb-4">
                Use the navigation menu to create produce or demand posts. Get real-time notifications when matches are found.
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <BellIcon className="w-4 h-4" />
                <span>Real-time notifications enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-slate-800">Post Produce</h4>
          </div>
          <p className="text-sm text-slate-600">
            List your agricultural products and connect with buyers instantly.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl shadow-md border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-slate-800">Find Demand</h4>
          </div>
          <p className="text-sm text-slate-600">
            Browse market demands and find the best opportunities for your produce.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-slate-800">Transport</h4>
          </div>
          <p className="text-sm text-slate-600">
            Connect with drivers and manage logistics for seamless delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
