const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
];

const OPTIONAL_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "CORS_ORIGIN",
  "FRONTEND_URL",
  "STRIPE_WEBHOOK_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_EMAIL_PASS",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
];

function isLoaded(name) {
  return Boolean(process.env[name] && process.env[name].trim());
}

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !isLoaded(name));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
    );
  }
}

function logEnvStatus() {
  const names = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS];

  console.log("Environment variable status:");
  names.forEach((name) => {
    console.log(`- ${name}: ${isLoaded(name) ? "loaded" : "missing"}`);
  });
}

module.exports = {
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
  validateEnv,
  logEnvStatus,
};
