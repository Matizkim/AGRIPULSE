import React from "react";
import { Link } from "react-router-dom";
import { DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <DocumentTextIcon className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Terms & Conditions</h1>
        <p className="text-xl text-slate-600">AgriPulse Platform Terms of Service</p>
        <p className="text-sm text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Terms Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
          <p className="text-slate-700 leading-relaxed">
            Welcome to AgriPulse. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
            AgriPulse is a marketplace connecting farmers, buyers, and transport providers in Kenya.
          </p>
        </section>

        {/* User Responsibilities */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Responsibilities</h2>
          <div className="space-y-3 text-slate-700">
            <p><strong>For Farmers:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate information about your produce, including quantity, quality, and pricing</li>
              <li>Ensure all listed products meet quality standards</li>
              <li>Honor agreed-upon prices and delivery terms</li>
              <li>Maintain proper documentation for your agricultural activities</li>
            </ul>
            <p className="mt-4"><strong>For Buyers:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate demand specifications and requirements</li>
              <li>Honor payment commitments as agreed</li>
              <li>Communicate clearly about delivery expectations</li>
              <li>Provide honest feedback and ratings</li>
            </ul>
            <p className="mt-4"><strong>For Transport Providers:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain valid licenses and insurance</li>
              <li>Provide accurate vehicle information and capacity</li>
              <li>Honor booking commitments and delivery schedules</li>
              <li>Ensure safe transport of goods</li>
            </ul>
          </div>
        </section>

        {/* Verification */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Account Verification</h2>
          <p className="text-slate-700 leading-relaxed">
            All users must complete the verification process by submitting valid identification documents. 
            Unverified accounts have limited access to platform features. AgriPulse reserves the right to 
            suspend or terminate accounts that fail verification or violate platform policies.
          </p>
        </section>

        {/* Transactions */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Transactions & Payments</h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            AgriPulse facilitates connections but does not process payments directly. All transactions are 
            between users. Users are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Negotiating terms and prices directly</li>
            <li>Arranging payment methods (M-Pesa, bank transfer, cash, etc.)</li>
            <li>Resolving payment disputes between parties</li>
            <li>Ensuring compliance with local tax regulations</li>
          </ul>
        </section>

        {/* Safety & Security */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Safety & Security</h2>
          <p className="text-slate-700 leading-relaxed">
            Users must report suspicious activity immediately. AgriPulse implements security measures but 
            cannot guarantee absolute security. Users are responsible for protecting their account credentials 
            and should not share login information.
          </p>
        </section>

        {/* Prohibited Activities */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Prohibited Activities</h2>
          <p className="text-slate-700 leading-relaxed mb-3">Users are prohibited from:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Posting false or misleading information</li>
            <li>Engaging in fraudulent activities</li>
            <li>Harassing or abusing other users</li>
            <li>Violating any applicable laws or regulations</li>
            <li>Attempting to circumvent platform security measures</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-slate-700 leading-relaxed">
            AgriPulse acts as a platform connecting users. We are not responsible for the quality of goods, 
            delivery performance, or payment disputes between users. Users transact at their own risk and 
            should exercise due diligence.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Changes to Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            AgriPulse reserves the right to modify these terms at any time. Users will be notified of 
            significant changes. Continued use of the platform constitutes acceptance of updated terms.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-slate-50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Questions About Terms?</h2>
          <p className="text-slate-700 mb-4">
            If you have questions about these terms, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> <a href="mailto:kinyuam047@gmail.com" className="text-green-600 hover:text-green-700">kinyuam047@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+254708244593" className="text-green-600 hover:text-green-700">+254 708 244 593</a></p>
            <p><strong>Address:</strong> 62000, Nairobi, Kenya</p>
          </div>
        </section>
      </div>
    </div>
  );
}

