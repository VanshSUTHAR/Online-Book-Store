import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { Mail, ArrowLeft, Info, KeyRound, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const navigate = useNavigate();

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      showToastMsg("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToastMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: trimmedEmail });
      if (res.data.success) {
        showToastMsg("✓ Verification code sent to your email!");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: trimmedEmail } });
        }, 1000);
      } else {
        showToastMsg(res.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Failed to send OTP. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 py-20 sm:py-4 relative">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none hidden sm:block" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Forgot Password?</h2>
          <p className="text-slate-500 text-xs font-semibold max-w-xs">
            Enter your registered email address and we'll send you a 6-digit verification OTP.
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Registered Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-1">
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/15 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Send Verification Code</span>
            )}
          </button>

          <div className="flex items-center justify-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
