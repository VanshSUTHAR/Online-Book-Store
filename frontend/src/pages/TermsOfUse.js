import React from "react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Use</h1>
        <p className="text-sm leading-7 text-slate-600 mb-4">
          These Terms of Use govern your access to and use of the Online Book Store website. By using the site, you agree
          to follow and be bound by these terms.
        </p>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Use of the Site</h2>
            <p className="text-sm leading-7 text-slate-600">
              You may use this site for lawful purposes only. You agree not to use the platform to post, transmit, or
              distribute unlawful content or to interfere with the operation of the service.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Responsibility</h2>
            <p className="text-sm leading-7 text-slate-600">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account. Notify us immediately if you suspect unauthorized access.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Order Terms</h2>
            <p className="text-sm leading-7 text-slate-600">
              Orders placed through the website are subject to availability and confirmation. Prices, taxes, and delivery
              charges are calculated at checkout and may change based on current offers and shipping selections.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Partner Applications</h2>
            <p className="text-sm leading-7 text-slate-600">
              Sellers who apply through the partner onboarding flow must provide accurate business information and supporting
              identity documents. Approval is subject to review by the Online Book Store team.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Intellectual Property</h2>
            <p className="text-sm leading-7 text-slate-600">
              All content on this website, including text, images, and design, is protected by intellectual property laws
              and may not be copied or reused without permission.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Changes to Terms</h2>
            <p className="text-sm leading-7 text-slate-600">
              We may update these terms from time to time. Continued use of the site after changes have been posted
              constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
