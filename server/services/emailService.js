import ApiError from "../utils/apiError.js";

const APP_NAME = "Cartify";

const EMAIL_VERIFICATION_TTL_MS =
  Number(process.env.EMAIL_VERIFICATION_TTL_MS) || 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS =
  Number(process.env.PASSWORD_RESET_TTL_MS) || 60 * 60 * 1000; // 1 hour


const VERIFY_EMAIL_PATH = process.env.EMAIL_VERIFY_PATH || "/verify-email";
const RESET_PASSWORD_PATH = process.env.PASSWORD_RESET_PATH || "/reset-password";

const BRAND_COLOR = "#F97316";
const TEXT_COLOR = "#1E293B";
const MUTED_COLOR = "#64748B";
const BORDER_COLOR = "#E2E8F0";


const failConfiguration = (missingVarNames) => {
  console.error(
    `emailService: missing required environment variable(s): ${missingVarNames.join(", ")}`
  );
  throw new ApiError(500, "Email service is not configured");
};


const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Renders a TTL as human-readable copy, e.g. "24 hours", "60 minutes". */
const formatDuration = (milliseconds) => {
  const minutes = Math.round(milliseconds / 60000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
};


const normalizeArgs = (userOrPayload, maybeToken, label) => {
  const source = userOrPayload || {};

  const token = typeof maybeToken === "string" ? maybeToken : source.token;
  const to = source.to || source.email;
  const name = source.name || source.username || "there";

  if (!to) {
    throw new ApiError(500, `Cannot send ${label} email without a recipient address`);
  }
  if (!token || typeof token !== "string") {
    throw new ApiError(500, `Cannot send ${label} email without a token`);
  }

  return { to, name, token };
};


const buildActionUrl = (path, token) => {
  const base = process.env.CLIENT_URL;
  if (!base) failConfiguration(["CLIENT_URL"]);

  const normalizedBase = base.trim().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let url;
  try {
    url = new URL(`${normalizedBase}${normalizedPath}`);
  } catch (error) {
    console.error("emailService: CLIENT_URL is not a valid absolute URL");
    throw new ApiError(500, "Email service is not configured");
  }

  url.searchParams.set("token", token);

  if (process.env.NODE_ENV === "production" && url.protocol === "http:") {
    url.protocol = "https:";
  }

  return url.toString();
};

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

// Created once, on first send, then reused — a new SMTP connection pool per
// email would be wasteful. Holds configuration only; no tokens, no messages.
let cachedTransporter = null;


const loadMailer = async () => {
  try {
    const nodemailer = await import("nodemailer");
    return nodemailer.default || nodemailer;
  } catch (error) {
    console.error(
      "emailService: the 'nodemailer' package is not installed — email cannot be sent until it is added as a dependency"
    );
    throw new ApiError(500, "Email service is unavailable", []);
  }
};

/** Reads SMTP settings from the environment and builds the transporter. */
const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  // SMTP_PASSWORD is the documented name; SMTP_PASS accepted as an alias.
  const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  const missing = [];
  if (!host) missing.push("SMTP_HOST");
  if (!port) missing.push("SMTP_PORT");
  if (!user) missing.push("SMTP_USER");
  if (!password) missing.push("SMTP_PASSWORD");
  if (missing.length > 0) failConfiguration(missing);

  const nodemailer = await loadMailer();

  // Implicit TLS on 465; STARTTLS elsewhere. Override with SMTP_SECURE.
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  return cachedTransporter;
};

/** Resolves the From header. Falls back to SMTP_USER when EMAIL_FROM is unset. */
const getFromAddress = () => {
  const configured = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!configured) failConfiguration(["EMAIL_FROM"]);

  // Already formatted as `Name <addr>`? Leave it alone.
  return configured.includes("<") ? configured : `${APP_NAME} <${configured}>`;
};


const dispatch = async ({ to, subject, text, html, label }) => {
  const transporter = await getTransporter();
  const from = getFromAddress();

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    // Deliberately narrow: SMTP status/command only. The message body, the
    // link and the raw token are all excluded.
    console.error(`emailService: failed to send ${label} email`, {
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
    });

    const failure = new ApiError(502, "Unable to send email at this time");
    failure.cause = error; // server-side inspection only; never serialized to a response
    throw failure;
  }
};


const renderLayout = ({ preheader, heading, bodyHtml, ctaLabel, ctaUrl, footerHtml }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:#F1F5F9;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid ${BORDER_COLOR};">
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
              <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">${APP_NAME}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${TEXT_COLOR};font-weight:600;">${escapeHtml(heading)}</h1>
              ${bodyHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:${BRAND_COLOR};">
                    <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;word-break:break-all;">
                <a href="${ctaUrl}" style="color:${BRAND_COLOR};text-decoration:underline;">${ctaUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${BORDER_COLOR};">
              ${footerHtml}
              <p style="margin:12px 0 0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">
                This is an automated message from ${APP_NAME}. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:${MUTED_COLOR};">
          &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

const buildVerificationEmail = ({ name, url, isResend }) => {
  const expiresIn = formatDuration(EMAIL_VERIFICATION_TTL_MS);
  const safeName = escapeHtml(name);

  const subject = isResend
    ? `${APP_NAME} — your new verification link`
    : `Verify your ${APP_NAME} account`;

  const intro = isResend
    ? `Here is a fresh link to verify your ${APP_NAME} account. Any earlier verification link is no longer valid.`
    : `Thanks for creating a ${APP_NAME} account. Please confirm this email address to activate your account.`;

  const html = renderLayout({
    preheader: `Verify your ${APP_NAME} account — this link expires in ${expiresIn}.`,
    heading: `Verify your ${APP_NAME} account`,
    ctaLabel: "Verify my account",
    ctaUrl: url,
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">${intro}</p>
      <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        This verification link expires in <strong>${expiresIn}</strong> and can be used only once.
      </p>`,
    footerHtml: `
      <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">
        If you did not create a ${APP_NAME} account, you can safely ignore this email and no account will be activated.
      </p>`,
  });

  const text = [
    `Hi ${name},`,
    "",
    intro,
    "",
    `Verify your ${APP_NAME} account using the link below:`,
    url,
    "",
    `This verification link expires in ${expiresIn} and can be used only once.`,
    "",
    `If you did not create a ${APP_NAME} account, you can safely ignore this email.`,
    "",
    `— The ${APP_NAME} team`,
  ].join("\n");

  return { subject, html, text };
};

const buildPasswordResetEmail = ({ name, url }) => {
  const expiresIn = formatDuration(PASSWORD_RESET_TTL_MS);
  const safeName = escapeHtml(name);

  const subject = `Reset your ${APP_NAME} password`;

  const html = renderLayout({
    preheader: `Reset your ${APP_NAME} password — this link expires in ${expiresIn}.`,
    heading: `Reset your ${APP_NAME} password`,
    ctaLabel: "Reset my password",
    ctaUrl: url,
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        We received a request to reset the password for your ${APP_NAME} account. Use the button below to choose a new one.
      </p>
      <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        This password reset link expires in <strong>${expiresIn}</strong> and can be used only once.
      </p>`,
    footerHtml: `
      <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">
        <strong style="color:${TEXT_COLOR};">Did not request this?</strong> You can safely ignore this email — your password will not change unless you open the link above and set a new one.
      </p>`,
  });

  const text = [
    `Hi ${name},`,
    "",
    `We received a request to reset the password for your ${APP_NAME} account.`,
    "",
    "Choose a new password using the link below:",
    url,
    "",
    `This password reset link expires in ${expiresIn} and can be used only once.`,
    "",
    "If you did not request a password reset, you can safely ignore this email — your password will not change unless you open the link above and set a new one.",
    "",
    `— The ${APP_NAME} team`,
  ].join("\n");

  return { subject, html, text };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * sendVerificationEmail(user, token) — or sendVerificationEmail({ to, name, token })
 *
 * @param {object} userOrPayload User-ish object ({ email|to, name }) or a
 *   payload that also carries `token`. Pass `resend: true` for the resend copy.
 * @param {string} [token] Raw verification token, when using the two-argument form.
 * @returns {Promise<void>} Resolves on accepted delivery; throws otherwise.
 */
const sendVerificationEmail = async (userOrPayload, token) => {
  const { to, name, token: rawToken } = normalizeArgs(
    userOrPayload,
    token,
    "verification"
  );

  const url = buildActionUrl(VERIFY_EMAIL_PATH, rawToken);
  const isResend = Boolean(userOrPayload && userOrPayload.resend);

  const { subject, html, text } = buildVerificationEmail({ name, url, isResend });

  await dispatch({ to, subject, text, html, label: "verification" });
};


const resendVerificationEmail = async (userOrPayload, token) =>
  sendVerificationEmail({ ...(userOrPayload || {}), resend: true }, token);

/**
 * sendPasswordResetEmail(user, token) — or sendPasswordResetEmail({ to, name, token })
 *
 * @param {object} userOrPayload User-ish object or payload carrying `token`.
 * @param {string} [token] Raw password-reset token, when using the two-argument form.
 * @returns {Promise<void>} Resolves on accepted delivery; throws otherwise.
 */
const sendPasswordResetEmail = async (userOrPayload, token) => {
  const { to, name, token: rawToken } = normalizeArgs(
    userOrPayload,
    token,
    "password reset"
  );

  const url = buildActionUrl(RESET_PASSWORD_PATH, rawToken);

  const { subject, html, text } = buildPasswordResetEmail({ name, url });

  await dispatch({ to, subject, text, html, label: "password reset" });
};

/**
 * sendContactConfirmation({ name, email, subject }) - Send contact form confirmation
 *
 * @param {object} payload - { name, email, subject }
 * @returns {Promise<void>}
 */
const sendContactConfirmation = async (payload) => {
  const { name, email, subject } = payload;

  if (!name || !email || !subject) {
    throw new ApiError(400, "Name, email, and subject are required");
  }

  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  const emailSubject = `We received your message — ${safeSubject}`;

  const html = renderLayout({
    preheader: "Thanks for contacting us. We'll be in touch soon.",
    heading: "Message Received",
    ctaLabel: "View our FAQ",
    ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">Thank you for reaching out to us with your message about "<strong>${safeSubject}</strong>".</p>
      <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">We have received your inquiry and our team will review it shortly. We typically respond within 24-48 hours during business days.</p>`,
    footerHtml: `
      <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">
        In the meantime, feel free to check our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/faq" style="color:${BRAND_COLOR};text-decoration:underline;">FAQ page</a> for quick answers to common questions.
      </p>`,
  });

  const text = [
    `Hi ${name},`,
    "",
    `Thank you for reaching out to us with your message about "${subject}".`,
    "",
    "We have received your inquiry and our team will review it shortly. We typically respond within 24-48 hours during business days.",
    "",
    "In the meantime, feel free to check our FAQ page for quick answers to common questions.",
    "",
    `— The ${APP_NAME} team`,
  ].join("\n");

  await dispatch({ to: email, subject: emailSubject, text, html, label: "contact confirmation" });
};

export default {
  sendVerificationEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
  sendContactConfirmation,
};
