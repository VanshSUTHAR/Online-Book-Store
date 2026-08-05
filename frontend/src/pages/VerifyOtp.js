import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../services/api";
import { ShieldCheck, ArrowLeft, Info, Loader2, RefreshCw, Mail } from "lucide-react";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || "";
  const email = initialEmail;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [toast, setToast] = useState("");

  const inputRefs = useRef([]);

  // Redirect if no email is provided
  useEffect(() => {
    if (!initialEmail) {
      showToastMsg("Please provide your email address first.");
      setTimeout(() => navigate("/forgot-password"), 1500);
    }
  }, [initialEmail, navigate]);

  // Resend 60s countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleOtpChange = (index, value) => {
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerifyOtp();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("").trim();
    if (otpCode.length !== 6) {
      showToastMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: otpCode,
      });

      if (res.data.success) {
        showToastMsg("✓ OTP verified successfully!");
        setTimeout(() => {
          navigate("/reset-password", {
            state: { email: email.toLowerCase().trim(), otp: otpCode },
          });
        }, 1000);
      } else {
        showToastMsg(res.data.message || "Invalid OTP code.");
      }
    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    try {
      const res = await api.post("/auth/resend-otp", {
        email: email.toLowerCase().trim(),
      });

      if (res.data.success) {
        showToastMsg("✓ A new 6-digit OTP has been sent to your email!");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        showToastMsg(res.data.message || "Failed to resend OTP.");
      }
    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 py-20 sm:py-4 relative">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none hidden sm:block" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/10">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Verify OTP</h2>
          <p className="text-slate-500 text-xs font-semibold max-w-xs">
            We sent a 6-digit verification code to:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mt-1">
            <Mail className="h-3.5 w-3.5 text-indigo-600" />
            <span>{email || "your email"}</span>
          </div>
        </div>

        {/* 6-Digit OTP Box inputs */}
        <div className="space-y-4 pt-2">
          <label className="block text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter 6-Digit Code
          </label>
          <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-bold font-mono text-indigo-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all duration-200 disabled:opacity-50"
              />
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
            Code valid for 5 minutes
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join("").length !== 6}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/15 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify OTP</span>
            )}
          </button>

          {/* Resend Countdown Button */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {resending
                ? "Sending new OTP..."
                : countdown > 0
                ? `Resend OTP in ${countdown}s`
                : "Resend OTP"}
            </button>

            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Email Address</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
