import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              AgriPulse
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Empowering the food supply chain through technology.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <a href="tel:+254708244593" className="hover:text-green-400 transition-colors">+254 708 244 593</a>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <a href="mailto:kinyuam047@gmail.com" className="hover:text-green-400 transition-colors">kinyuam047@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>62000, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-green-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/produce" className="text-slate-300 hover:text-green-400 transition-colors">
                  Produce
                </Link>
              </li>
              <li>
                <Link to="/demand" className="text-slate-300 hover:text-green-400 transition-colors">
                  Demand
                </Link>
              </li>
              <li>
                <Link to="/transport" className="text-slate-300 hover:text-green-400 transition-colors">
                  Transport
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-green-400">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-slate-300 hover:text-green-400 transition-colors text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <Link to="/safety" className="text-slate-300 hover:text-green-400 transition-colors">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-300 hover:text-green-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("premium")}
                  className="text-slate-300 hover:text-green-400 transition-colors text-left"
                >
                  Premium Plans
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-green-400">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("safety")}
                  className="text-slate-300 hover:text-green-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <Link to="/terms" className="text-slate-300 hover:text-green-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("premium")}
                  className="text-slate-300 hover:text-green-400 transition-colors text-left"
                >
                  Become a Partner
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-2 text-slate-400 text-sm">
            © {new Date().getFullYear()} AgriPulse. Made with{" "}
            <HeartIcon className="w-4 h-4 text-red-400 animate-pulse" /> in Kenya
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span>Follow us:</span>
            <a href="#" className="hover:text-green-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-green-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-green-400 transition-colors">TikTok</a>
            <a href="#" className="hover:text-green-400 transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
