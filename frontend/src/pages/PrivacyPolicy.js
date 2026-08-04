import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-slate-950 px-8 py-12 sm:px-12 sm:py-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">
                Privacy Policy
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                We protect your personal data.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Online Book Store collects only the information required to deliver your orders, power your account, and improve your experience.
              </p>
            </div>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-[1.1fr_0.9fr] sm:p-10">
            <div className="space-y-6">
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">01</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  We collect your name, email, phone number, shipping address, and order details. Payment information is securely handled by Stripe.
                </p>
              </section>
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">02</div>
                  <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Data</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Your data powers account management, order processing, shipping updates, and customer support.
                  It also helps us personalize your bookstore experience.
                </p>
              </section>
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">03</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Cookies & Tracking</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  We use cookies and local storage to keep your cart active, save your preferences, and maintain login sessions.
                  These tools are not used for intrusive advertising.
                </p>
              </section>
            </div>
            <aside className="space-y-6">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-2xl">
                <h3 className="text-xl font-semibold text-white">Our Privacy Promise</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  We use personal data only for order fulfillment, account support, and service improvements.
                  Payment details are never stored on our servers.
                </p>
                <ul className="mt-6 space-y-4 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    No selling of personal data.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    Secure Stripe payments.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-300">✓</span>
                    Shipping updates only when needed.
                  </li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Need help?</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Have questions about privacy or data handling? Use the contact form on the site and we’ll respond promptly.
                </p>
              </div>
            </aside>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-8 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Account Safety</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  We keep account credentials private and secure.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Secure Payments</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Payments are processed through Stripe and protected by industry-standard security.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Transparent Orders</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Track your order history, purchase details, and shipping status from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
