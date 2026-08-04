import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Database, 
  BookOpen, 
  Cookie, 
  Lock, 
  CheckCircle2, 
  LifeBuoy, 
  CreditCard, 
  MapPin, 
  UserCheck 
} from "lucide-react";

export default function PrivacyPolicy() {
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
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[300px] w-[300px] rounded-full bg-violet-400/5 blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-100/50">
          
          {/* Header Banner */}
          <div className="bg-slate-900 px-5 py-10 sm:px-12 sm:py-14 relative overflow-hidden border-b border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pointer-events-none" />
            <div className="relative max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 border border-blue-500/25">
                <ShieldCheck className="h-3.5 w-3.5" />
                Privacy Policy
              </span>
              <h1 className="font-playfair text-3xl font-black text-white sm:text-5xl tracking-tight leading-tight">
                Your Trust is Our <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Priority</span>.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
                At Online Books, we respect your privacy. This policy outlines how we protect and manage your personal data when you explore, purchase books, or interact with our platform.
              </p>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid gap-8 p-5 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            
            {/* Left Column: Core Sections */}
            <div className="space-y-6">
              
              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 shadow-sm border border-blue-100">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      1. Information We Collect
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      We collect name, email, phone number, and physical shipping address when you create an account, purchase books, or contact customer care. All billing and card numbers are processed directly off-site.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 shadow-sm border border-blue-100">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      2. How We Use Your Data
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      We process your data to deliver physical books, print address labels for couriers, provide parcel tracking codes, manage reader profiles, and send necessary order confirmations.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 shadow-sm border border-blue-100">
                    <Cookie className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      3. Cookies & Storage
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      We use browser local storage to save your checkout cart selections and wishlist titles. We also utilize essential session tokens to keep your reader profile securely logged in. We do not run tracking cookies.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-slate-150 bg-slate-50/50 p-5 sm:p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 shadow-sm border border-blue-100">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-playfair text-slate-900 leading-snug">
                      4. Data Protection
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      We secure databases using standard access keys. Stripe manages card credentials under high-level PCI compliance; we never store card digits or CVVs on our backend.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">
              
              {/* Privacy Promise Card */}
              <div className="rounded-xl sm:rounded-2xl bg-slate-900 p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/10 rounded-bl-full pointer-events-none" />
                <h3 className="text-base sm:text-lg font-bold font-playfair text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                  Privacy Promise
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Online Books is built for reader convenience. We adhere to these commitments:
                </p>
                <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>We never trade or sell reader information.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Transactions are fully encrypted via Stripe.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Couriers receive only your contact & address.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>You hold complete control to edit your profile details.</span>
                  </li>
                </ul>
              </div>

              {/* Support Card */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <LifeBuoy className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Manage Your Data
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Have inquiries regarding stored addresses, order logs, or wish to request profile deletion? Contact our support staff.
                </p>
                <button 
                  onClick={handleContactRedirect}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Contact Support
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Highlights Section */}
          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Reader Confidentiality</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    Accounts and purchase histories are kept confidential on modern infrastructure.
                  </p>
                </div>
              </div>
              
              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Secure checkouts</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    All payment processing runs inside fully sandboxed Stripe portals.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Shipment Safety</h4>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                    Addresses are strictly shared with trusted logistics groups for parcel routing.
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

