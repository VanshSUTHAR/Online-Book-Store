import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../services/api";
import { Lock, Eye, EyeOff, Info, KeyRound, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!email || !otp) {
      showToastMsg("Session invalid. Please start the password reset process again.");
      setTimeout(() => navigate("/forgot-password"), 1500);
    }
  }, [email, otp, navigate]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showToastMsg("Please enter both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToastMsg("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      showToastMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: email.toLowerCase().trim(),
        otp,
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (res.data.success) {
        showToastMsg("✓ Password reset successful!");
        setTimeout(() => {
          navigate("/login", {
            state: { toastMessage: "✓ Password reset successfully! Please log in with your new password." },
          });
        }, 1200);
      } else {
        showToastMsg(res.data.message || "Failed to reset password.");
      }
    } catch (error) {
      showToastMsg(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleResetPassword();
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/10">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Reset Password</h2>
          <p className="text-slate-500 text-xs font-semibold max-w-xs">
            Enter a strong new password for your account.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Reset Password</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center pt-1">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel and Return to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
