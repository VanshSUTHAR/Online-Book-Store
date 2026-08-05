const nodemailer = require("nodemailer");

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

const createTransporter = () => {
  const { user, pass } = getMailConfig();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const getFromAddress = () => {
  const { user } = getMailConfig();
  return `Online Book Store <${user}>`;
};

async function sendStoreMail({ to, subject, text, html }) {
  return createTransporter().sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  createTransporter,
  getFromAddress,
  getMailConfig,
  sendStoreMail,
};
