import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  X,
  ShieldCheck,
  Send,
  BookOpen,
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");

  // --- OTP modal state ---------------------------------------------------
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [otpStep, setOtpStep] = useState("email"); // "email" | "otp"
  const [otpLoginEmail, setOtpLoginEmail] = useState("");
  const [otpEmailError, setOtpEmailError] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendBusy, setResendBusy] = useState(false);
  const otpBoxRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useUser();

  useEffect(() => {
    const loggedInUserId = user?._id || user?.id;
    if (loggedInUserId) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(location.state?.from || "/");
      }
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
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToastMsg("Please enter email and password.");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      const loggedInUser = res.data.user;

      localStorage.setItem("userId", loggedInUser._id);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      login(loggedInUser);
      showToastMsg("✓ Login successful");

      const fromPath = location.state?.from || "/";
      const extraState = location.state ? { ...location.state } : {};
      delete extraState.from;

      setTimeout(() => {
        if (loggedInUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate(fromPath, { state: extraState });
        }
      }, 1200);
    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };

  const handleLoginKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // --- OTP modal helpers ---------------------------------------------------

  const resetOtpModal = () => {
    setShowOtpLogin(false);
    setOtpStep("email");
    setOtpLoginEmail("");
    setOtpEmailError("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setOtpSending(false);
    setOtpVerifying(false);
    setOtpVerified(false);
    setResendCooldown(0);
    setResendBusy(false);
  };

  const focusOtpBox = (index) => {
    const el = otpBoxRefs.current[index];
    if (el) el.focus();
  };

  const sendOtp = async ({ isResend = false } = {}) => {
    const trimmedEmail = otpLoginEmail.trim();
    if (!trimmedEmail) {
      setOtpEmailError("Enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setOtpEmailError("Enter a valid email address.");
      return;
    }
    setOtpEmailError("");
    isResend ? setResendBusy(true) : setOtpSending(true);

    try {
      const res = await api.post("/auth/send-otp", {
        email: trimmedEmail,
      });

      if (res.data.success) {
        setOtpStep("otp");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);

        showToastMsg(
          res.data.otp
            ? `${res.data.message}\nOTP: ${res.data.otp}`
            : res.data.message || `Code sent to ${maskEmail(trimmedEmail)}`
        );

        setTimeout(() => focusOtpBox(0), 50);
      } else {
        setOtpEmailError(res.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);

      setOtpEmailError(
        error.response?.data?.message ||
        "Failed to send OTP. Please try again."
      );
    } finally {
      setOtpSending(false);
      setResendBusy(false);
    }
  };

  const handleOtpDigitChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setOtpError("");
    if (digit && index < OTP_LENGTH - 1) {
      focusOtpBox(index + 1);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        focusOtpBox(index - 1);
      }
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtpDigits(next);
    focusOtpBox(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const verifyOtp = useCallback(async () => {
    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await api.post("/auth/verify-otp", {
        email: otpLoginEmail.trim(),
        otp: code
      });
      if (res.data.success && res.data.user) {
        localStorage.setItem("userId", res.data.user._id);
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        setOtpVerified(true);
        login(res.data.user);

        const fromPath = location.state?.from || "/";
        const extraState = location.state ? { ...location.state } : {};
        delete extraState.from;

        setTimeout(() => {
          resetOtpModal();
          if (res.data.user.role === "admin") {
            navigate("/admin");
          } else {
            navigate(fromPath, { state: extraState });
          }
        }, 900);
      } else {
        setOtpError(res.data.message || "Invalid code. Please try again.");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        focusOtpBox(0);
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits, otpLoginEmail, location, login, navigate]);

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 py-20 sm:py-4 relative">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none hidden sm:block" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Welcome Back</h2>
          <p className="text-slate-400 text-xs font-semibold">Enter your account credentials to log in</p>
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleLoginKeyDown}
                autoComplete="username"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleLoginKeyDown}
                autoComplete="current-password"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons and actions */}
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95"
          >
            Log In
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => setShowOtpLogin(true)}
              className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in with OTP
            </button>
            <span className="text-slate-400 font-semibold">
              New here?{" "}
              <Link to="/register" state={location.state} className="text-blue-600 hover:underline">
                Create Account
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Floating notifications */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* OTP Modal Overlay */}
      {showOtpLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) resetOtpModal(); }}
          onKeyDown={(e) => { if (e.key === "Escape") resetOtpModal(); }}
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">

            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              {otpStep === "otp" ? (
                <button
                  onClick={() => {
                    setOtpStep("email");
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                    setOtpError("");
                    setResendCooldown(0);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors -ml-1 px-1 py-1 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : <span />}
              <button
                onClick={resetOtpModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Icon + title */}
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-base">
                {otpStep === "email" ? "Login with OTP" : "Enter Verification Code"}
              </h3>
              <p className="text-xs text-slate-400 font-medium max-w-[280px] leading-relaxed">
                {otpStep === "email"
                  ? "We'll email you a one-time code to sign in — no password needed."
                  : <>Code sent to <span className="font-bold text-slate-600">{maskEmail(otpLoginEmail.trim())}</span></>}
              </p>
            </div>

            {otpStep === "email" ? (
              /* --- Step 1: email --- */
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={otpLoginEmail}
                      onChange={(e) => { setOtpLoginEmail(e.target.value); setOtpEmailError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                      autoFocus
                      className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 transition-all ${otpEmailError
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                        }`}
                    />
                  </div>
                  {otpEmailError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1.5">{otpEmailError}</p>
                  )}
                </div>
                <button
                  disabled={otpSending}
                  onClick={() => sendOtp()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition-colors"
                >
                  {otpSending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* --- Step 2: otp --- */
              <div className="space-y-5">
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
                        disabled={otpVerified}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-10 rounded-xl border text-center text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${otpError
                          ? "border-red-300 focus:ring-red-100"
                          : otpVerified
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

                {otpVerified ? (
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-200 py-2.5 text-xs font-bold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified — logging you in...
                  </div>
                ) : (
                  <button
                    onClick={verifyOtp}
                    disabled={otpVerifying || otpDigits.join("").length !== OTP_LENGTH}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    {otpVerifying ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify and Log In"
                    )}
                  </button>
                )}

                {!otpVerified && (
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
        </div>
      )}
    </div>
  );
}