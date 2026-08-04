import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 sm:px-12 sm:py-14">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100 shadow-sm">
              Privacy Policy
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Your privacy is our priority.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
              Online Book Store collects only the information necessary to deliver your orders, improve your experience,
              and keep your account secure.
            </p>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-[1.2fr_0.8fr] sm:p-10">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  When you register, shop, or contact support, we may collect your name, email, phone number, address,
                  and order details. Payment details are handled securely through Stripe.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Data</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  We use your information to create your account, process purchases, track shipping, and deliver
                  customer service. Your data also helps us personalize recommendations and improve the store.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Cookies & Tracking</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Cookies and local storage help keep your cart active, remember preferences, and manage login sessions.
                  We do not use these tools for intrusive advertising or unknown third-party tracking.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-2xl">
                <h3 className="text-xl font-semibold text-white">What makes us different</h3>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    Data is only used for order fulfillment and support.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    No selling of personal data to third parties.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    Order updates and delivery info are shared only when needed.
                  </li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Contact & support</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Have questions about privacy or your account? Reach out through the website contact form and our team
                  will respond promptly.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Account Safety</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  We keep your login details confidential and never share them without your permission.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Secure Payments</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Payments are processed securely through Stripe, and we never store raw card numbers on our servers.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Order Transparency</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  You can review past purchases, shipment details, and buyer information through your account dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
