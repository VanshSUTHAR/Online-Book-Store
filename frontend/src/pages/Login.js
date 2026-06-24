import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  BookOpen
} from "lucide-react";

export default function Login() {
  // OTP login states
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [otpLoginEmail, setOtpLoginEmail] = useState("");
  const [otpSentLogin, setOtpSentLogin] = useState(false);
  const [otpLogin, setOtpLogin] = useState("");
  const [otpLoginToast, setOtpLoginToast] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");

  const navigate = useNavigate();
  const { login } = useUser();

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

      const user = res.data.user;

      // Store credentials
      localStorage.setItem("userId", user._id);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      login(user);
      showToastMsg("✓ Login successful");

      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1200);

    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const showOtpToastMsg = (msg) => {
    setOtpLoginToast(msg);
    setTimeout(() => setOtpLoginToast(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Welcome Back</h2>
          <p className="text-slate-400 text-xs font-semibold">Enter your account credentials to log in</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
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
              <Link to="/register" className="text-blue-600 hover:underline">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-205">
            <button
              onClick={() => {
                setShowOtpLogin(false);
                setOtpSentLogin(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-poppins font-bold text-slate-900 text-base">
                Login with OTP
              </h3>
            </div>

            {!otpSentLogin ? (
              /* Requesting email code */
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={otpLoginEmail}
                    onChange={(e) => setOtpLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  disabled={otpSending}
                  onClick={async () => {
                    if (!otpLoginEmail.trim()) {
                      showOtpToastMsg("Please enter your email.");
                      return;
                    }
                    setOtpSending(true);
                    try {
                      const res = await api.post("/auth/send-otp", {
                        email: otpLoginEmail.trim()
                      });
                      if (res.data.success) {
                        setOtpSentLogin(true);
                        showOtpToastMsg("OTP code sent to email.");
                      } else {
                        showOtpToastMsg(res.data.message || "Failed to send OTP.");
                      }
                    } catch {
                      showOtpToastMsg("Failed to send OTP.");
                    } finally {
                      setOtpSending(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  {otpSending ? "Sending code..." : "Send Verification Code"}
                </button>
              </div>
            ) : (
              /* Verifying email code */
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpLogin}
                    onChange={(e) => setOtpLogin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!otpLogin.trim()) {
                      showOtpToastMsg("Please enter OTP.");
                      return;
                    }
                    try {
                      const res = await api.post("/auth/verify-otp", {
                        email: otpLoginEmail.trim(),
                        otp: otpLogin.trim()
                      });
                      if (res.data.success && res.data.user) {
                        localStorage.setItem("userId", res.data.user._id);
                        if (res.data.token) {
                          localStorage.setItem("token", res.data.token);
                        }
                        login(res.data.user);
                        showOtpToastMsg("✓ Login successful");
                        setTimeout(() => {
                          setShowOtpLogin(false);
                          setOtpSentLogin(false);
                          setOtpLoginEmail("");
                          setOtpLogin("");
                          if (res.data.user.role === "admin") {
                            navigate("/admin");
                          } else {
                            navigate("/");
                          }
                        }, 1200);
                      } else {
                        showOtpToastMsg(res.data.message || "Invalid OTP code.");
                      }
                    } catch {
                      showOtpToastMsg("Failed to login with OTP.");
                    }
                  }}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Verify and Log In
                </button>
              </div>
            )}

            {/* OTP specific status notifications */}
            {otpLoginToast && (
              <div className="mt-3.5 rounded-lg bg-slate-900 py-2 text-center text-[11px] text-white font-semibold">
                {otpLoginToast}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
