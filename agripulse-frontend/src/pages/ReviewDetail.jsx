import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function ReviewDetail() {
  const { id } = useParams();

  // Dummy review data - in production, fetch from API
  const reviews = {
    "testimonial-1": {
      id: "testimonial-1",
      quote: "I now sell my vegetables directly to buyers without brokers. My income has increased by 40%!",
      author: "Agnes Wanjiku",
      role: "Farmer",
      location: "Kirinyaga",
      stars: 5,
      date: "2 weeks ago",
      verified: true,
      fullReview: "AgriPulse has completely transformed my farming business. Before, I had to rely on middlemen who would take a huge cut of my profits. Now, I connect directly with buyers and get fair prices for my produce. The verification system gives buyers confidence, and I've built lasting relationships with several restaurants in Nairobi. Highly recommend!",
      rating: {
        communication: 5,
        reliability: 5,
        quality: 5,
        value: 5,
      },
    },
    "testimonial-2": {
      id: "testimonial-2",
      quote: "The matching feature saved me hours of searching for suppliers. I found exactly what I needed in minutes.",
      author: "David Ochieng",
      role: "Restaurant Buyer",
      location: "Nairobi",
      stars: 5,
      date: "1 week ago",
      verified: true,
      fullReview: "As a restaurant owner, finding fresh, quality produce at fair prices was always a challenge. AgriPulse's smart matching system connects me with verified farmers who have exactly what I need. The platform is intuitive, and the verification process ensures I'm dealing with legitimate suppliers. My food costs have decreased while quality has improved.",
      rating: {
        communication: 5,
        reliability: 4,
        quality: 5,
        value: 5,
      },
    },
    "testimonial-3": {
      id: "testimonial-3",
      quote: "I get transport jobs every week thanks to the platform. The verification system gives me credibility.",
      author: "Musa Hassan",
      role: "Transporter",
      location: "Eldoret",
      stars: 5,
      date: "3 days ago",
      verified: true,
      fullReview: "Being a verified transporter on AgriPulse has been a game-changer. I get regular jobs from farmers and buyers who trust the platform. The rating system helps me build my reputation, and I've seen a steady increase in bookings. The payment system is secure, and I always get paid on time.",
      rating: {
        communication: 5,
        reliability: 5,
        quality: 4,
        value: 5,
      },
    },
  };

  const review = reviews[id] || reviews["testimonial-1"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Review Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{review.author}</h2>
              <p className="text-slate-600">{review.role} • {review.location}</p>
              {review.verified && (
                <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  Verified User
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-1 mb-2">
              {[...Array(review.stars)].map((_, i) => (
                <StarIconSolid key={i} className="w-6 h-6 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-slate-500">{review.date}</p>
          </div>
        </div>

        {/* Quote */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border-l-4 border-green-500">
          <p className="text-lg text-slate-800 italic">"{review.quote}"</p>
        </div>

        {/* Full Review */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Full Review</h3>
          <p className="text-slate-700 leading-relaxed">{review.fullReview}</p>
        </div>

        {/* Detailed Ratings */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Ratings</h3>
          <div className="space-y-3">
            {Object.entries(review.rating).map(([category, score]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-slate-700 capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`w-5 h-5 ${i < score ? "text-yellow-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-600 font-semibold w-8">{score}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Reviews */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">More Reviews</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(reviews)
            .filter((r) => r.id !== review.id)
            .slice(0, 2)
            .map((r) => (
              <Link
                key={r.id}
                to={`/reviews/${r.id}`}
                className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{r.author}</p>
                    <p className="text-sm text-slate-600">{r.role}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm italic mb-3">"{r.quote.substring(0, 100)}..."</p>
                <div className="flex gap-1">
                  {[...Array(r.stars)].map((_, i) => (
                    <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

