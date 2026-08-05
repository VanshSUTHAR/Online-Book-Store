const nodemailer = require("nodemailer");
const dns = require("dns").promises;

const getMailConfig = () => {
  const user = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();
  const pass = (
    process.env.EMAIL_ADMIN_PASS ||
    process.env.EMAIL_PASS ||
    process.env.ADMIN_EMAIL_PASS ||
    ""
  ).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("Missing email SMTP credentials. Set EMAIL_ADMIN and EMAIL_ADMIN_PASS in Render.");
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
    tls: {
      servername: host,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    debugInfo: {
      configuredHost: host,
      resolvedHost,
      port,
      secure,
      requireTLS: !secure,
    },
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
  const { user } = getMailConfig();
  return `Online Book Store <${user}>`;
};

async function sendStoreMail({ to, subject, text, html }) {
  const transporter = await createTransporter();

  try {
    return await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    err.mailerDebugInfo = {
      ...transporter.mailerDebugInfo,
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
