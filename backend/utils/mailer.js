const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const dns = require("dns").promises;

// ─────────────────────────────────────────────
// RESEND (primary — HTTPS API, works on Render free tier)
// ─────────────────────────────────────────────
const getResendClient = () => {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey || apiKey === "re_REPLACE_ME") return null;
  return new Resend(apiKey);
};

const getFromAddress = () => {
  // When using Resend, you must send from a verified domain.
  // Free Resend accounts can send from: onboarding@resend.dev (for testing only)
  // Once you add your domain in Resend dashboard, change this to e.g. noreply@yourdomain.com
  const resendFrom = (process.env.RESEND_FROM || "").trim();
  if (resendFrom) return resendFrom;

  // Fallback: use Gmail address for SMTP
  const user = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();
  return `Online Book Store <${user}>`;
};

// ─────────────────────────────────────────────
// SMTP (fallback — nodemailer + Gmail)
// ─────────────────────────────────────────────
const getMailConfig = () => {
  const user = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();
  const pass = (
    process.env.EMAIL_ADMIN_PASS ||
    process.env.EMAIL_PASS ||
    process.env.ADMIN_EMAIL_PASS ||
    ""
  ).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("Missing email SMTP credentials. Set EMAIL_ADMIN and EMAIL_ADMIN_PASS.");
  }

  return { user, pass };
};

const getTransportOptions = async () => {
  const { user, pass } = getMailConfig();
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  let resolvedHost = host;

  try {
    const [ipv4Host] = await dns.resolve4(host);
    resolvedHost = ipv4Host || host;
  } catch (err) {
    console.warn(`[MAIL] IPv4 DNS lookup failed for ${host}:`, err.message);
  }

  return {
    host: resolvedHost,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    tls: { servername: host },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };
};

const createTransporter = async () => {
  const options = await getTransportOptions();
  return nodemailer.createTransport(options);
};

// ─────────────────────────────────────────────
// sendStoreMail — tries Resend first, falls back to SMTP
// ─────────────────────────────────────────────
async function sendStoreMail({ to, subject, text, html }) {
  const resend = getResendClient();

  if (resend) {
    // ── Resend path (HTTPS, no port blocking) ──
    try {
      const from = getFromAddress();
      const { data, error } = await resend.emails.send({ from, to, subject, text, html });

      if (error) {
        console.error("[MAIL:RESEND] Error:", error);
        throw new Error(error.message || "Resend API error");
      }

      console.log("[MAIL:RESEND] Sent successfully. ID:", data?.id);
      return data;
    } catch (err) {
      console.error("[MAIL:RESEND] Failed, trying SMTP fallback:", err.message);
      // fall through to SMTP
    }
  }

  // ── SMTP path (nodemailer) ──
  try {
    const transporter = await createTransporter();
    const from = getFromAddress();
    const result = await transporter.sendMail({ from, to, subject, text, html });
    console.log("[MAIL:SMTP] Sent successfully.");
    return result;
  } catch (err) {
    console.error("[MAIL:SMTP] Failed:", err.message);
    err.mailerDebugInfo = {
      code: err.code,
      command: err.command,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port,
    };
    throw err;
  }
}

module.exports = {
  createTransporter,
  getFromAddress,
  getMailConfig,
  getTransportOptions,
  sendStoreMail,
};
