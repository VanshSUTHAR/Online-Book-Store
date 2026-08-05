import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Info,
  BookOpen,
  Send,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  const maskedLen = Math.max(name.length - visible.length, 3);
  return `${visible}${"•".repeat(maskedLen)}@${domain}`;
}

export default function Register() {
  // --- Step 1: form state ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");
  const [formError, setFormError] = useState("");

  // --- Step 2: OTP state ---
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendBusy, setResendBusy] = useState(false);

  const otpBoxRefs = useRef([]);
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    const loggedInUserId = user?._id || user?.id;
    if (loggedInUserId) {
      const fromPath = location.state?.from;
      const shouldGoToAdmin =
        user?.role === "admin" &&
        (!fromPath || fromPath === "/login" || fromPath === "/register");
      navigate(shouldGoToAdmin ? "/admin" : fromPath || "/");
    }
  }, [user, navigate, location]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const focusOtpBox = (index) => {
    const el = otpBoxRefs.current[index];
    if (el) el.focus();
  };

  const autofillOtp = (otpCode) => {
    if (!otpCode || otpCode.length !== OTP_LENGTH) return;
    setOtpDigits(otpCode.split(""));
    setOtpError("");
  };

  // --- Send OTP (new registration) ---
  const sendOtp = async ({ isResend = false } = {}) => {
    if (!isResend) {
      // Validate form fields
      if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
        setFormError("Please fill in all fields.");
        return;
      }
      if (!EMAIL_RE.test(email.trim())) {
        setFormError("Enter a valid email address.");
        return;
      }
      setFormError("");
    }

    isResend ? setResendBusy(true) : setSending(true);

    try {
      const res = await api.post("/auth/send-register-otp", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        setStep("otp");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);

        if (res.data.otp) {
          setReceivedOtp(res.data.otp);
          autofillOtp(res.data.otp);
        }

        showToastMsg(`Verification code sent to ${maskEmail(email.trim())}`);
        setTimeout(() => focusOtpBox(0), 50);
      } else {
        setFormError(res.data.message || "Failed to send verification code.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to send code. Please try again.";
      isResend ? setOtpError(msg) : setFormError(msg);
    } finally {
      setSending(false);
      setResendBusy(false);
    }
  };

  // --- OTP digit handlers ---
  const handleOtpDigitChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setOtpError("");
    if (digit && index < OTP_LENGTH - 1) focusOtpBox(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) focusOtpBox(index - 1);
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusOtpBox(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusOtpBox(index + 1);
    } else if (e.key === "Enter") {
      verifyOtp();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);
    focusOtpBox(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  // --- Verify OTP and create account ---
  const verifyOtp = useCallback(async () => {
    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }
    setVerifying(true);
    setOtpError("");

    try {
      const res = await api.post("/auth/verify-register-otp", {
        email: email.toLowerCase().trim(),
        otp: code,
      });

      if (res.data.success && res.data.user) {
        localStorage.setItem("userId", res.data.user._id);
        if (res.data.token) localStorage.setItem("token", res.data.token);

        setVerified(true);
        login(res.data.user);
        showToastMsg("✓ Account created successfully!");

        const fromPath = location.state?.from || "/";
        const extraState = location.state ? { ...location.state } : {};
        delete extraState.from;

        setTimeout(() => {
          const shouldGoToAdmin =
            res.data.user.role === "admin" &&
            (!location.state?.from ||
              location.state?.from === "/login" ||
              location.state?.from === "/register");
          navigate(shouldGoToAdmin ? "/admin" : fromPath, {
            state: extraState,
          });
        }, 900);
      } else {
        setOtpError(res.data.message || "Invalid code. Please try again.");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        focusOtpBox(0);
      }
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      focusOtpBox(0);
    } finally {
      setVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits, email, location, login, navigate]);

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 py-20 sm:py-4 relative">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none hidden sm:block" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-xl relative z-10 space-y-6">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            {step === "form" ? (
              <BookOpen className="h-5 w-5 text-white" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-white" />
            )}
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">
            {step === "form" ? "Create Account" : "Verify Your Email"}
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            {step === "form"
              ? "Join us to start curating your library list"
              : <>Code sent to <span className="font-bold text-slate-600">{maskEmail(email.trim())}</span></>}
          </p>
        </div>

        {step === "form" ? (
          /* ======================== STEP 1: REGISTRATION FORM ======================== */
          <>
            <div className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormError(""); }}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => { setMobile(e.target.value); setFormError(""); }}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <p className="text-xs text-red-500 font-semibold -mt-2 px-1">{formError}</p>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => sendOtp()}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed py-3 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/15 active:scale-[0.98]"
              >
                {sending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending Code...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Verification Code</>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 font-semibold pt-1">
                Already have an account?{" "}
                <Link to="/login" state={location.state} className="text-blue-600 hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* ======================== STEP 2: OTP VERIFICATION ======================== */
          <div className="space-y-5">

            {/* Back button */}
            <button
              onClick={() => {
                setStep("form");
                setOtpDigits(Array(OTP_LENGTH).fill(""));
                setOtpError("");
                setResendCooldown(0);
                setVerified(false);
                setReceivedOtp("");
              }}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors -mt-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to form
            </button>

            {/* Dev helper — OTP display + autofill */}
            {receivedOtp && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-800">
                <div>
                  <span className="block text-[10px] text-amber-600 font-bold uppercase">Your Verification OTP</span>
                  <span className="font-mono text-base font-black tracking-widest text-amber-900">{receivedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => autofillOtp(receivedOtp)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow transition-all active:scale-95"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {/* OTP boxes */}
            <div>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpBoxRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={verified}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`h-12 w-10 rounded-xl border text-center text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      otpError
                        ? "border-red-300 focus:ring-red-100"
                        : verified
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                    }`}
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-[10px] text-red-500 font-semibold text-center mt-2.5">{otpError}</p>
              )}
            </div>

            {/* Verify button or success */}
            {verified ? (
              <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-200 py-2.5 text-xs font-bold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified — creating your account...
              </div>
            ) : (
              <button
                onClick={verifyOtp}
                disabled={verifying || otpDigits.join("").length !== OTP_LENGTH}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition-colors"
              >
                {verifying ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...</>
                ) : (
                  "Verify & Create Account"
                )}
              </button>
            )}

            {/* Resend */}
            {!verified && (
              <div className="text-center text-[11px] text-slate-400 font-semibold">
                {resendCooldown > 0 ? (
                  <span>Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={() => sendOtp({ isResend: true })}
                    disabled={resendBusy}
                    className="font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-colors"
                  >
                    {resendBusy ? "Resending..." : "Didn't get a code? Resend"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
