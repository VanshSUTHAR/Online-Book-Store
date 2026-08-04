import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm leading-7 text-slate-600 mb-4">
          Welcome to Online Book Store. We respect your privacy and are committed to protecting your personal data.
          This privacy policy explains how we collect, use, and safeguard information when you visit and interact
          with our website.
        </p>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Information We Collect</h2>
            <p className="text-sm leading-7 text-slate-600">
              We collect information you provide when you register, log in, place an order, or contact us. This may include
              your name, email address, phone number, shipping address, and payment details used for processing orders.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">How We Use Your Information</h2>
            <p className="text-sm leading-7 text-slate-600">
              Your data helps us create your account, process purchases, communicate order updates, and provide customer support.
              We also use it to maintain a personalized shopping experience and improve the Online Book Store service.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Cookies and Tracking</h2>
            <p className="text-sm leading-7 text-slate-600">
              We may use cookies or local storage to remember your preferences, keep your shopping cart active, and support
              session-based features such as login and checkout.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sharing Your Data</h2>
            <p className="text-sm leading-7 text-slate-600">
              We do not sell your personal information. We may share order-related data with trusted service providers like payment
              gateways and delivery partners only when necessary to fulfill your order.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Security</h2>
            <p className="text-sm leading-7 text-slate-600">
              We take reasonable measures to protect your information and restrict access to authorized team members.
              However, no online system can be perfectly secure.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Contact</h2>
            <p className="text-sm leading-7 text-slate-600">
              If you have questions about this policy or how your data is handled, please contact us through the website
              contact form.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
