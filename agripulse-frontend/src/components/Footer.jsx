import React from "react";
import { HeartIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-600 to-emerald-600 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">AgriPulse</h3>
            <p className="text-green-100 text-sm">
              Connecting farmers, buyers, and drivers for a sustainable agricultural marketplace in Kenya.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-green-100">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/produce" className="hover:text-white transition-colors">Produce</a></li>
              <li><a href="/demand" className="hover:text-white transition-colors">Demand</a></li>
              <li><a href="/matches" className="hover:text-white transition-colors">Matches</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <p className="text-green-100 text-sm">
              Built for SDG-aligned agritech in Kenya. Empowering local farmers and connecting communities.
            </p>
          </div>
        </div>
        <div className="border-t border-green-500 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-green-100">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} AgriPulse. Made with <HeartIcon className="w-4 h-4 text-red-300" /> in Kenya
          </p>
          <p className="mt-2 sm:mt-0">All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
