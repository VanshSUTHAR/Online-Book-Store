import React from "react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-violet-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-10 sm:px-12 sm:py-14">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100 shadow-sm">
              Terms of Use
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Rules for using Online Book Store</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
              These terms describe your rights and responsibilities when using our platform to browse, buy, partner, or manage orders.
            </p>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-[1.2fr_0.8fr] sm:p-10">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Acceptable Use</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use Online Book Store for lawful purchases and seller onboarding only. Do not try to disrupt the service or
                  submit fraudulent orders.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Account Responsibility</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Keep your login details private and notify us immediately if your account is compromised.
                  You are responsible for all activity under your account.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Order Conditions</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Orders are subject to product availability, pricing, and shipping charges at checkout. We strive to keep
                  details transparent and accurate before you confirm payment.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-2xl">
                <h3 className="text-xl font-semibold text-white">Partner & seller terms</h3>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    Partner applications must be honest and include valid business documents.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    Approval decisions are made by the admin team and may be revoked if policies are violated.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-400/20 text-fuchsia-300">✓</span>
                    You agree to follow our process for adding books, uploading images, and fulfilling orders.
                  </li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Intellectual Property</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  All site content is protected by copyright and may not be reused without permission. This includes text,
                  layout, and artwork.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Transparent support</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Contact support if you have questions about your order, account, or partner application.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Payment clarity</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Checkout totals are shown before payment and include any applicable shipping and tax components.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Policy updates</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  We may revise terms or privacy details over time. Continued use means you accept the latest version.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
