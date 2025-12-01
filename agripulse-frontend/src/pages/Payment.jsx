import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "pro";
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const tierInfo = {
    pro: {
      name: "Pro Tier",
      price: "KES 500",
      period: "per month",
    },
    business: {
      name: "Business Tier",
      price: "KES 2,000",
      period: "per month",
    },
  };

  const currentTier = tierInfo[tier] || tierInfo.pro;

  const paymentMethods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: DevicePhoneMobileIcon,
      description: "Pay via M-Pesa mobile money",
      color: "green",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: BanknotesIcon,
      description: "Direct bank transfer",
      color: "blue",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: CreditCardIcon,
      description: "Pay with PayPal account",
      color: "indigo",
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }
    // Here you would integrate with actual payment gateway
    alert(`Payment processing for ${currentTier.name} via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Complete Your Payment</h1>
        <p className="text-xl text-slate-600">Choose your preferred payment method</p>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Plan Summary */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{currentTier.name}</h2>
            <p className="text-slate-600">Subscription Plan</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-green-600">{currentTier.price}</div>
            <div className="text-slate-600">{currentTier.period}</div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedMethod === method.id
                    ? `border-${method.color}-500 bg-${method.color}-50`
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${method.color}-100 rounded-lg`}>
                    <Icon className={`w-8 h-8 text-${method.color}-600`} />
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircleIconSolid className={`w-6 h-6 text-${method.color}-600`} />
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{method.name}</h4>
                <p className="text-sm text-slate-600">{method.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Form */}
      {selectedMethod && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Details</h3>
          
          {selectedMethod === "mpesa" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  You will receive an M-Pesa prompt on your phone. Enter your PIN to complete the payment.
                </p>
              </div>
            </div>
          )}

          {selectedMethod === "bank" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your account number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Bank Details:</strong><br />
                  Account Name: AgriPulse Ltd<br />
                  Account Number: 1234567890<br />
                  Bank: Equity Bank Kenya<br />
                  Branch: Nairobi
                </p>
              </div>
            </div>
          )}

          {selectedMethod === "paypal" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handlePayment}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
          >
            Complete Payment - {currentTier.price}
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="flex items-start gap-3">
          <CheckCircleIconSolid className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Secure Payment</h4>
            <p className="text-sm text-slate-600">
              All payments are processed securely. We use industry-standard encryption to protect your financial information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

