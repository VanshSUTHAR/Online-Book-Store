import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyOtp() {
  const query = useQuery();
  const initialEmail = query.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !otp) return setError("Email and OTP required");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setSuccess(res.data.message || "Verified");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    if (!email) return setError("Enter your email to resend OTP");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message || "OTP resent");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-form">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify} className="auth-form">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>OTP</label>
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" required />

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
          <button type="button" onClick={handleResend} disabled={loading}>{loading ? '...' : 'Resend OTP'}</button>
        </div>
      </form>
    </div>
  );
}
