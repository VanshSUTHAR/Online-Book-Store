import React from "react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-slate-900 px-8 py-12 sm:px-12 sm:py-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-700">
                Terms of Use
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Rules for using Online Book Store.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                These terms explain your rights and responsibilities when browsing, buying, partnering, or managing orders on our platform.
              </p>
            </div>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-[1.1fr_0.9fr] sm:p-10">
            <div className="space-y-6">
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">01</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Acceptable Use</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Use Online Book Store for lawful shopping and legitimate seller onboarding. Do not attempt to disrupt the service or use it for fraudulent activities.
                </p>
              </section>
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">02</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Account Responsibility</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Keep your account credentials private and immediately report suspected unauthorized activity.
                  You are responsible for actions taken under your account.
                </p>
              </section>
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">03</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Order Conditions</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Orders depend on product availability, pricing, and shipping fees shown at checkout. We aim for accuracy, but confirmations are final once payment is processed.
                </p>
              </section>
            </div>
            <aside className="space-y-6">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-2xl">
                <h3 className="text-xl font-semibold text-white">Partner & Seller Terms</h3>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    Partners must provide accurate business documents during application.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    Admin approval is required and may be revoked for policy violations.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    Partners agree to follow the process for book uploads and order fulfillment.
                  </li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Intellectual Property</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Site content is protected by copyright and may not be reused or reproduced without permission.
                </p>
              </div>
            </aside>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-8 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Support Access</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Reach out to support if you have questions about your order, account, or seller application.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Payment Details</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Checkout totals are shown clearly before payment and include any applicable taxes and shipping fees.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Policy Updates</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  We may update terms from time to time. Continued use of the site means you accept the latest version.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
