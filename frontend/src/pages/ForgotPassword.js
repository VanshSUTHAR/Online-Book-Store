import { useState } from "react";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) return setError("Please enter your email");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.toLowerCase().trim() });
      setSuccess(res.data.message || "OTP sent");
      // navigate to verify page after slight delay so user sees success
      setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`), 700);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 py-20 sm:py-4 relative">
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none hidden sm:block" />

      <div className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-xl relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-playfair text-2xl font-black text-slate-900 mt-2">Forgot Password</h2>
          <p className="text-slate-400 text-xs font-semibold">Enter your email to receive a verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-4 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}
          {success && <div className="text-sm text-green-600 font-medium">{success}</div>}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/15 active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <div className="flex items-center justify-center text-xs pt-1">
              <span className="text-slate-400 font-semibold">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
              </span>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
