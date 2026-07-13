import React, { useState, useEffect } from "react";
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
  BookOpen
} from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");

  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

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

  const register = async () => {
    if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      showToastMsg("Please fill in all fields.");
      return;
    }
    try {
      const res = await api.post("/auth/register", {
        name,
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        password,
        role: "customer"
      });

      // Synchronize credentials
      login(res.data.user);
      localStorage.setItem("userId", res.data.user._id);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      showToastMsg("✓ Registration successful!");

      const fromPath = location.state?.from || "/";
      const extraState = location.state ? { ...location.state } : {};
      delete extraState.from;

      setTimeout(() => {
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate(fromPath, { state: extraState });
        }
      }, 1200);
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Registration failed.");
    }
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      {/* Box Card wrapper */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Create Account</h2>
          <p className="text-slate-400 text-xs font-semibold">Join us to start curating your library list</p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">

          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Mobile Number
            </label>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Buttons and actions */}
        <div className="space-y-4">
          <button
            onClick={register}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95"
          >
            Register Account
          </button>

          <p className="text-center text-xs text-slate-400 font-semibold pt-1">
            Already have an account?{" "}
            <Link to="/login" state={location.state} className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Floating status notifications */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
