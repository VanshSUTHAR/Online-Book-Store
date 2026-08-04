import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Scale, 
  BookOpen, 
  UserCheck, 
  CreditCard, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  LifeBuoy, 
  Lock, 
  RefreshCw 
} from "lucide-react";

export default function TermsOfUse() {
  const navigate = useNavigate();

  const handleContactRedirect = () => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById("contact-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Blurs */}
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[300px] w-[300px] rounded-full bg-indigo-400/5 blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-100/50">
          
          {/* Header Banner */}
          <div className="bg-slate-900 px-5 py-10 sm:px-12 sm:py-14 relative overflow-hidden border-b border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 pointer-events-none" />
            <div className="relative max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-400 border border-violet-500/25">
                <Scale className="h-3.5 w-3.5" />
                Terms of Use
              </span>
              <h1 className="font-playfair text-3xl font-black text-white sm:text-5xl tracking-tight leading-tight">
                Rules of Our <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">Book Store</span>.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
                By accessing Online Books, you agree to these guidelines. They define your rights as a reader, partner seller, or store operator, ensuring a safe experience for everyone.
              </p>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid gap-8 p-5 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            
            {/* Left Column: Core Sections */}
            <div className="space-y-6">
              
              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0 shadow-sm border border-violet-100">
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      1. Acceptable Account Conduct
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      Use our bookstore for legitimate shopping, reviews, and seller onboarding. Cyberattacks, automated catalog scraping, spamming reviews, or posting fraudulent partner forms is strictly banned.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0 shadow-sm border border-violet-100">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      2. Purchase & Checkout Terms
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      Orders depend on stock availability. Product descriptions and shipping quotes are finalized upon Stripe payment confirmations. We reserve the right to cancel orders in case of catalog pricing errors.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0 shadow-sm border border-violet-100">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      3. Bookstore Partner Roles
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      Independent bookstore partners applying to display books must offer authentic, undamaged copies. Partners must accurately fulfill shipments and respect platform pricing guidelines.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0 shadow-sm border border-violet-100">
                    <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      4. Operations & Disclaimers
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      While we guarantee a highly available web catalog, we are not responsible for hosting connection outages, external API server delays, or minor courier delays beyond our jurisdiction.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">
              
              {/* Partner Terms Card */}
              <div className="rounded-xl sm:rounded-2xl bg-slate-900 p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/10 rounded-bl-full pointer-events-none" />
                <h3 className="text-base sm:text-lg font-bold font-playfair text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-400 shrink-0" />
                  Partner & Seller Rules
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Sellers uploading listings must satisfy these requirements:
                </p>
                <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Upload valid business credentials and store names.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Provide exact summaries and pictures for books.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Fulfill orders within the delivery promise window.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Admin approvals are mandatory for live listing publishing.</span>
                  </li>
                </ul>
              </div>

              {/* Intellectual Property Card */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Intellectual Property
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  All logos, text collections, graphic assets, database records, and site layouts are protected properties of Online Books. Redistribution or code cloning is forbidden without authorization.
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Highlights Section */}
          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                  <LifeBuoy className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Helpful Support</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    Reach support directly via home contact sections or support tickets.
                  </p>
                </div>
              </div>
              
              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Secure Payments</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    Cart totals are detailed, protected, and routed off-site by Stripe security.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <RefreshCw className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Policy Evolutions</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    Terms may change; continued checkout operations imply agreement.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

