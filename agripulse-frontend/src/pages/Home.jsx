import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/clerk-react";
import { fetchDemands } from "../api/demand";
import { getCurrentUser } from "../api/users";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TruckIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [recentDemands, setRecentDemands] = useState([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [userTier, setUserTier] = useState(null);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if signed-in user needs to select a plan
  useEffect(() => {
    const checkUserTier = async () => {
      if (isSignedIn) {
        try {
          const user = await getCurrentUser();
          // If user doesn't have a tier, redirect to plan selection immediately
          if (!user || !user.tier) {
            navigate("/plan-selection");
            return;
          }
          // Store user tier to conditionally show premium section
          setUserTier(user.tier);
        } catch (err) {
          // If error fetching user (e.g., 500 error), still redirect to plan selection
          // This ensures new users always go through plan selection first
          console.error("Error checking user tier:", err);
          navigate("/plan-selection");
        }
      }
    };
    // Small delay to ensure Clerk is fully initialized
    const timer = setTimeout(() => {
      checkUserTier();
    }, 100);
    return () => clearTimeout(timer);
  }, [isSignedIn, navigate]);

  // Fetch recent demands for "What Buyers Want Now" section
  useEffect(() => {
    const loadRecentDemands = async () => {
      try {
        const data = await fetchDemands({ limit: 3, sortBy: "newest" });
        if (data.demands) {
          setRecentDemands(data.demands.slice(0, 3));
        } else if (Array.isArray(data)) {
          setRecentDemands(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading recent demands:", err);
      }
    };
    loadRecentDemands();
  }, []);

  const imagePath = (filename) => {
    // Use public path - images should be in public/images folder
    return `/images/${filename}`;
  };

  return (
    <div className="space-y-0">
      {/* SECTION 1 — HERO SECTION */}
      <section 
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${imagePath("badge1.png")})`,
          backgroundSize: '150%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Vibrant overlay with appealing colors - better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/85 via-green-600/80 to-teal-700/85"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-green-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-green-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 items-center justify-center">
            <div className="space-y-6 sm:space-y-8 animate-fade-in-up text-center w-full lg:max-w-2xl">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl">
                  Connecting Farmers, Buyers & Transport.
                  <span className="block text-yellow-200 mt-2">Fairly. Instantly. Seamlessly.</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed drop-shadow-lg">
                  Agripulse eliminates middlemen by linking you directly to trusted farmers, verified buyers, and reliable transport providers — all in one platform built for transparency and fair trade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
                <Link
                  to="/produce"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-emerald-500/50 hover:from-emerald-400 hover:via-green-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Find Produce</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demand"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-white/98 text-emerald-700 border-2 border-yellow-300 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-yellow-300/50 hover:bg-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Post Your Demand</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/transport"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-emerald-400 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-emerald-400/50 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Get Transport</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — HOW AGRIPULSE WORKS */}
      <section 
        id="how-it-works"
        className="py-12 sm:py-16 md:py-20 bg-white relative overflow-hidden scroll-mt-20"
        style={{
          backgroundImage: `url(${imagePath("agripulse-working.png")})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Lighter overlay to showcase the working image */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/85 to-white/90"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">How AgriPulse Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">Three simple steps to connect and trade</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                step: "1",
                title: "Farmers Post Their Fresh Produce",
                description: "Upload photos, set quantity, location, and pricing. Instantly connect with buyers near you.",
                icon: ShoppingBagIcon,
                color: "green",
              },
              {
                step: "2",
                title: "Buyers Share Their Needs & Get Instant Matches",
                description: "Post food demands by category and location. See real-time offers from verified farmers.",
                icon: ClipboardDocumentListIcon,
                color: "emerald",
              },
              {
                step: "3",
                title: "Choose Reliable Transport & Complete Your Deal",
                description: "Select from trusted transport providers or bring your own. Track everything from your dashboard.",
                icon: TruckIcon,
                color: "blue",
              },
            ].map((item, idx) => {
              const routes = ["/produce", "/demand", "/transport"];
              return (
              <Link
                key={idx}
                to={routes[idx]}
                className="group relative bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 cursor-pointer block"
              >
                <div className={`absolute top-0 left-0 w-1.5 sm:w-2 h-full rounded-l-xl sm:rounded-l-2xl ${
                item.color === 'green' ? 'bg-gradient-to-b from-emerald-500 via-green-500 to-teal-500' :
                item.color === 'emerald' ? 'bg-gradient-to-b from-teal-500 via-emerald-500 to-cyan-500' :
                'bg-gradient-to-b from-cyan-500 via-blue-500 to-indigo-500'
              }`}></div>
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 ${
                  item.color === 'green' ? 'bg-gradient-to-br from-emerald-100 to-green-100' :
                  item.color === 'emerald' ? 'bg-gradient-to-br from-teal-100 to-emerald-100' :
                  'bg-gradient-to-br from-cyan-100 to-blue-100'
                }`}>
                  <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    item.color === 'green' ? 'text-emerald-600' :
                    item.color === 'emerald' ? 'text-teal-600' :
                    'text-cyan-600'
                  }`} />
                </div>
                <div className={`text-4xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 ${
                  item.color === 'green' ? 'text-emerald-100' :
                  item.color === 'emerald' ? 'text-teal-100' :
                  'text-cyan-100'
                }`}>{item.step}</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{item.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>Learn more</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
            })}
          </div>

          {/* Auto-scrolling image carousel - infinite circular scroll */}
          <div className="mt-8 overflow-hidden relative">
            <div className="flex animate-scroll-left" style={{ gap: '0.75rem' }}>
              {/* First set of images */}
              {[
                { src: imagePath("agripulse-working.png"), alt: "How AgriPulse Works" },
                { src: imagePath("hero image.png"), alt: "AgriPulse Hero" },
                { src: imagePath("badge1.png"), alt: "AgriPulse Badge" },
                { src: imagePath("farmer.png"), alt: "Farmer" },
                { src: imagePath("buyer.png"), alt: "Buyer" },
              ].map((img, idx) => (
                <div key={`first-${idx}`} className="flex-shrink-0" style={{ width: '320px' }}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                { src: imagePath("agripulse-working.png"), alt: "How AgriPulse Works" },
                { src: imagePath("hero image.png"), alt: "AgriPulse Hero" },
                { src: imagePath("badge1.png"), alt: "AgriPulse Badge" },
                { src: imagePath("farmer.png"), alt: "Farmer" },
                { src: imagePath("buyer.png"), alt: "Buyer" },
              ].map((img, idx) => (
                <div key={`second-${idx}`} className="flex-shrink-0" style={{ width: '320px' }}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY AGRIPULSE? */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Why AgriPulse?</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">Built for fairness, trust, and efficiency</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                title: "Fair Prices. No Middlemen.",
                description: "Direct farm-to-market transactions ensure farmers earn more and buyers get better value.",
                icon: CheckCircleIconSolid,
              },
              {
                title: "Verified Users Only",
                description: "Every farmer, buyer, and driver is vetted for safety and reliability.",
                icon: ShieldCheckIcon,
              },
              {
                title: "Smart Matching System",
                description: "We automatically recommend the nearest best seller, buyer, or transport.",
                icon: SparklesIcon,
              },
              {
                title: "Secure Communication",
                description: "Chat inside the platform — no spam calls, no fake numbers, no scams.",
                icon: CheckCircleIconSolid,
              },
              {
                title: "Ratings & Reviews",
                description: "Build trust with transparent ratings among farmers, buyers, and transport providers.",
                icon: StarIconSolid,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[1, 2, 3].map((num) => (
              <img
                key={num}
                src={imagePath(`badge${num}.png`)}
                alt={`Badge ${num}`}
                className="h-16 sm:h-20 md:h-24 w-auto object-contain hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOT BUYER DEMANDS */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">What Buyers Want Right Now</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8">
              Join hundreds of businesses and households posting what they need today.
            </p>
            <Link
              to="/demand"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all text-sm sm:text-base"
            >
              Create your demand
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              "500 kg onions needed in Nakuru",
              "100 crates of tomatoes needed by Monday",
              "2 tons of cabbage for school supply",
            ].map((demand, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 sm:p-6 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <ClipboardDocumentListIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-slate-800 font-medium">{demand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — TRANSPORT */}
      <section 
        className="py-12 sm:py-16 md:py-20 relative"
        style={{
          backgroundImage: `url(${imagePath("truck.png")})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Vibrant overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 via-indigo-700/75 to-cyan-700/80"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Move Your Goods Safely & Fast</h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-50 mb-6 sm:mb-8 leading-relaxed">
                Whether you need a pickup, a lorry, a motorcycle, or a refrigerated truck — we've got verified transport providers ready to move your goods across counties.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "Farm-to-market delivery",
                  "Inter-county transport",
                  "Bulk cargo hauling",
                  "Cold-chain delivery",
                ].map((service, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircleIconSolid className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 flex-shrink-0" />
                    <span className="text-blue-50 text-base sm:text-lg">{service}</span>
                  </div>
                ))}
              </div>

              <p className="text-blue-100 italic text-sm sm:text-base mb-6 sm:mb-8">Every driver is reviewed and rated by farmers and buyers.</p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/transport"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 text-blue-700 border-2 border-white rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 transform hover:scale-105 justify-center"
                >
                  <span>Select Transport</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/transport"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/95 text-white border-2 border-blue-400 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 justify-center"
                >
                  <span>Find Drivers</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Show truck image on larger screens - no duplicate since it's already the background */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl"></div>
                <div className="relative p-8 text-center">
                  <TruckIcon className="w-32 h-32 mx-auto text-blue-200/80 mb-4" />
                  <p className="text-blue-100 text-lg font-semibold">Verified Transport Partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">What Users Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">Trusted by Farmers, Buyers & Transporters Across Kenya</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                id: "testimonial-1",
                quote: "I now sell my vegetables directly to buyers without brokers. My income has increased by 40%!",
                author: "Agnes Wanjiku",
                role: "Farmer (Kirinyaga)",
                stars: 5,
                date: "2 weeks ago",
                verified: true,
              },
              {
                id: "testimonial-2",
                quote: "The matching feature saved me hours of searching for suppliers. I found exactly what I needed in minutes.",
                author: "David Ochieng",
                role: "Restaurant Buyer (Nairobi)",
                stars: 5,
                date: "1 week ago",
                verified: true,
              },
              {
                id: "testimonial-3",
                quote: "I get transport jobs every week thanks to the platform. The verification system gives me credibility.",
                author: "Musa Hassan",
                role: "Transporter (Eldoret)",
                stars: 5,
                date: "3 days ago",
                verified: true,
              },
            ].map((testimonial) => (
              <Link
                key={testimonial.id}
                to={`/reviews/${testimonial.id}`}
                className="bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer block transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <StarIconSolid key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Verified</span>
                  )}
                </div>
                <p className="text-slate-700 text-base sm:text-lg mb-4 sm:mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">– {testimonial.author}</p>
                  <p className="text-slate-600 text-xs sm:text-sm">{testimonial.role}</p>
                  <p className="text-slate-400 text-xs mt-1">{testimonial.date}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8 — SAFETY & TRUST */}
      <section id="safety" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheckIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-green-400" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">We Prioritize Safety. Always.</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-12">
              Agripulse has built-in safety features to protect users and ensure fair transactions.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {[
                "Verified accounts",
                "Hidden phone numbers until match is confirmed",
                "Secure in-platform chat",
                "Ratings & reviews",
                "Fraud detection & reporting tools",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-left">
                  <CheckCircleIconSolid className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              to="/safety"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all text-sm sm:text-base"
            >
              Learn more about Safety
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 11 — PREMIUM PLANS */}
      {/* Only show premium section if user is not signed in or doesn't have a tier yet */}
      {(!isSignedIn || !userTier) && (
      <section id="premium" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-amber-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Unlock More Power with AgriPulse Premium</h2>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
            {[
              {
                name: "Basic",
                price: "Free",
                features: ["Post demands & produce", "Use chat", "Search & view profiles"],
                color: "slate",
              },
              {
                name: "Pro Tier",
                price: "KES 500/month",
                features: ["Boosted visibility (top of search)", "Priority matching", "Unlimited chats", "Premium badge next to profile"],
                color: "green",
                popular: true,
                hasPremiumTag: true,
              },
              {
                name: "Business Tier",
                price: "KES 2,000/month",
                features: ["Dedicated account manager", "Bulk analytics", "Unlimited boosted posts", "Team access"],
                color: "amber",
                hasPremiumTag: true,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${
                  plan.popular ? "border-amber-400 lg:scale-105" : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-full text-xs sm:text-sm font-bold z-10">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.hasPremiumTag && (
                    <img
                      src={imagePath("premium.png")}
                      alt="Premium"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-90"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-green-600 mb-4 sm:mb-6">{plan.price}</div>
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircleIconSolid className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === "Basic" ? (
                  <SignedIn>
                    <Link
                      to="/plan-selection"
                      className="w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm sm:text-base text-center block"
                    >
                      Get Started
                    </Link>
                  </SignedIn>
                ) : (plan.name === "Pro Tier" || plan.name === "Business Tier") ? (
                  <button
                    onClick={() => setShowComingSoon(true)}
                    className="w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm sm:text-base"
                  >
                    Get Started
                  </button>
                ) : (
                  <button className="w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-xl font-semibold cursor-not-allowed text-sm sm:text-base">
                    Current Plan
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* SECTION 12 — JOIN COMMUNITY */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Join The Community</h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">Be Part of Kenya's Fastest Growing Agricultural Marketplace</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6 sm:mb-8 text-base sm:text-lg">
            <div>
              <div className="text-3xl sm:text-4xl font-black">10,000+</div>
              <div className="text-green-100 text-sm sm:text-base">Verified Users</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black">Thousands</div>
              <div className="text-green-100 text-sm sm:text-base">Successful Deals</div>
            </div>
          </div>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">Trusted by farmers, buyers, and transporters</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <SignedOut>
              <SignUpButton>
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-700 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:bg-green-50 transition-all transform hover:scale-105">
                  Create Account
                </button>
              </SignUpButton>
            </SignedOut>
            <Link
              to="/produce"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-green-800 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:bg-green-900 transition-all transform hover:scale-105"
            >
              Explore Market
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-green-500 rounded-full p-6 animate-bounce">
                    <SparklesIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Coming Soon!</h2>
              <p className="text-slate-600 mb-6">
                Premium payment processing is currently under development. We'll notify you as soon as it's available!
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-320px * 5 - 12px * 4));
          }
        }
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
          display: flex;
          width: max-content;
        }
        @media (max-width: 640px) {
          .animate-blob {
            animation-duration: 10s;
          }
          .animate-scroll-left {
            animation-duration: 15s;
          }
        }
      `}</style>
    </div>
  );
}
