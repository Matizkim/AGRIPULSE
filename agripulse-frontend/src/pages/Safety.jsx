import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  LockClosedIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function Safety() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <ShieldCheckIcon className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Safety & Trust Center</h1>
        <p className="text-xl text-slate-600">Your security and peace of mind are our top priorities</p>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Safety Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIconSolid className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Accounts</h3>
              <p className="text-slate-600">
                Every user undergoes a verification process. We verify identity documents and business credentials to ensure you're dealing with legitimate farmers, buyers, and transporters.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <EyeSlashIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hidden Contact Information</h3>
              <p className="text-slate-600">
                Your phone number and personal contact details remain private until you accept a match. This protects you from spam calls and unwanted contact.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure In-Platform Chat</h3>
              <p className="text-slate-600">
                All communications happen within our secure platform. No need to share personal numbers until you're ready. All conversations are logged for safety.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIconSolid className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ratings & Reviews</h3>
              <p className="text-slate-600">
                Build trust through transparent ratings. Every transaction can be reviewed, helping you make informed decisions about who to work with.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fraud Detection & Reporting</h3>
              <p className="text-slate-600">
                Our system monitors for suspicious activity. Report any concerns immediately, and our team will investigate. We take fraud seriously.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <LockClosedIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Data Protection</h3>
              <p className="text-slate-600">
                Your personal information is encrypted and protected. We follow best practices for data security and never share your information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Safety Tips for Users</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-slate-700">Always verify the other party's verification badge before proceeding with a transaction.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-slate-700">Use the in-platform chat for initial communications. Avoid sharing personal numbers too early.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-slate-700">Check ratings and reviews before making decisions. Read what others have experienced.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-slate-700">Report any suspicious behavior immediately. Our team responds quickly to safety concerns.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-slate-700">Meet in public places for initial transactions if meeting in person. Always prioritize your safety.</span>
          </li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h2>
        <p className="text-slate-600 mb-6">
          If you have safety concerns or need assistance, our support team is here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href={`mailto:kinyuam047@gmail.com?subject=Safety Concern&body=Please describe your safety concern or question:`}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Contact Safety Team
          </a>
          <a
            href={`mailto:kinyuam047@gmail.com?subject=Report an Issue&body=Please describe the issue you'd like to report:`}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
          >
            Report an Issue
          </a>
        </div>
      </div>
    </div>
  );
}

