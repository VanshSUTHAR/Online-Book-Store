const nodemailer = require("nodemailer");
const dns = require("dns").promises;

// ─────────────────────────────────────────────────────────────
// Mail config — reads Brevo credentials first, falls back to
// generic SMTP env vars (EMAIL_ADMIN / EMAIL_ADMIN_PASS).
// Brevo SMTP works on Render free tier (port 587, whitelisted).
// ─────────────────────────────────────────────────────────────

const getMailConfig = () => {
  // Brevo SMTP credentials (preferred)
  const brevoUser = (process.env.BREVO_SMTP_USER || "").trim();
  const brevoKey  = (process.env.BREVO_SMTP_KEY  || "").trim();

  if (brevoUser && brevoKey) {
    return {
      host:   process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port:   Number(process.env.SMTP_PORT || 587),
      secure: false,          // Brevo uses STARTTLS on 587
      user:   brevoUser,
      pass:   brevoKey,
    };
  }

  // Generic Gmail / custom SMTP fallback
  const user = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();
  const pass = (
    process.env.EMAIL_ADMIN_PASS ||
    process.env.EMAIL_PASS       ||
    process.env.ADMIN_EMAIL_PASS ||
    ""
  ).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "Missing SMTP credentials. Set BREVO_SMTP_USER + BREVO_SMTP_KEY (or EMAIL_ADMIN + EMAIL_ADMIN_PASS) in your environment."
    );
  }

  return {
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT || 587),
    secure: false,
    user,
    pass,
  };
};

const getTransportOptions = async () => {
  const { host, port, secure, user, pass } = getMailConfig();

  let resolvedHost = host;
  try {
    const addresses = await dns.resolve4(host);
    if (addresses && addresses[0]) resolvedHost = addresses[0];
  } catch (err) {
    console.warn(`[MAIL] IPv4 DNS lookup failed for ${host}:`, err.message);
  }

  return {
    host: resolvedHost,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    tls: {
      servername: host, // keep original hostname for TLS SNI
    },
    connectionTimeout: 10000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
    debugInfo: { configuredHost: host, resolvedHost, port, secure },
  };
};

const createTransporter = async () => {
  const options = await getTransportOptions();
  const { debugInfo, ...transportOptions } = options;
  const transporter = nodemailer.createTransport(transportOptions);
  transporter.mailerDebugInfo = debugInfo;
  return transporter;
};

const getFromAddress = () => {
  // Brevo requires the "from" address to be your verified sender address
  const from = (process.env.MAIL_FROM_ADDRESS || "").trim();
  if (from) return from;

  // Fallback: use the SMTP login address
  const { user } = getMailConfig();
  return `Online Book Store <${user}>`;
};

async function sendStoreMail({ to, subject, text, html }) {
  const transporter = await createTransporter();

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });
    console.log("[MAIL] Sent successfully via", transporter.mailerDebugInfo?.configuredHost);
    return info;
  } catch (err) {
    err.mailerDebugInfo = {
      ...transporter.mailerDebugInfo,
      code:    err.code,
      command: err.command,
      errno:   err.errno,
      syscall: err.syscall,
      address: err.address,
      port:    err.port,
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
