import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I know a farmer or buyer is genuine?",
      answer: "All users go through a verification process where we verify their identity documents and business credentials. Look for the 'Verified' badge on user profiles. Additionally, you can check ratings and reviews from previous transactions.",
    },
    {
      question: "How does matching work?",
      answer: "Our smart matching system uses location, crop type, quantity, and price preferences to find the best matches. When you post a demand or listing, we automatically suggest compatible partners nearby. You can then review and accept matches.",
    },
    {
      question: "Is my phone number safe?",
      answer: "Yes, your phone number is hidden until you accept a match. All initial communications happen through our secure in-platform chat. Your contact information is only shared when both parties agree to proceed with a transaction.",
    },
    {
      question: "Does AgriPulse take commissions?",
      answer: "No, deals are direct between users. We don't charge commissions on transactions. Premium features like boosted visibility and priority matching are optional paid upgrades, but the basic platform is free to use.",
    },
    {
      question: "How do I verify my account?",
      answer: "During registration, you'll be asked to submit your National ID and other legal documents. Our admin team reviews these documents and verifies your account. This process typically takes 24-48 hours. You'll receive a notification once verified.",
    },
    {
      question: "Can I edit my produce listing after posting?",
      answer: "Yes, farmers can edit their produce listings. Edits require admin approval to ensure accuracy. You can also delete your listings at any time without approval.",
    },
    {
      question: "How do I contact support?",
      answer: "You can contact us via email at Agripulseltd@gmail.com or call +254 708 244 593. You can also use the in-platform messaging system to contact our admin team for assistance.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "Currently, payments are handled directly between users. We're working on integrated payment options including M-Pesa, bank transfers, and PayPal. Premium subscriptions will support these payment methods when available.",
    },
    {
      question: "How do I report a problem or suspicious activity?",
      answer: "Use the 'Report an Issue' feature in the Safety Center or contact our admin team directly. We take all reports seriously and investigate promptly. Your safety is our priority.",
    },
    {
      question: "Can I use AgriPulse on my phone?",
      answer: "Yes! AgriPulse is fully responsive and works great on mobile devices. You can access all features including posting, browsing, messaging, and managing your listings from your smartphone.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-24 md:pt-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <QuestionMarkCircleIcon className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-slate-600">Find answers to common questions about AgriPulse</p>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-lg font-semibold text-slate-900 pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUpIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 pt-2 border-t border-slate-100">
                <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
        <p className="text-slate-600 mb-6">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:Agripulseltd@gmail.com"
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Email Us
          </a>
          <a
            href="tel:+254708244593"
            className="px-6 py-3 bg-white text-green-700 border-2 border-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}

