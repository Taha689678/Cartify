import dotenv from "dotenv";
dotenv.config();

export const payfastConfig = {
  enabled: process.env.PAYFAST_ENABLED === "true",
  environment: process.env.PAYFAST_ENVIRONMENT || "sandbox",
  merchantId: process.env.PAYFAST_MERCHANT_ID || "",
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
  passPhrase: process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_SECURE_KEY || "",
  returnUrl: process.env.PAYFAST_RETURN_URL || "",
  cancelUrl: process.env.PAYFAST_CANCEL_URL || "",
  notifyUrl: process.env.PAYFAST_NOTIFY_URL || process.env.PAYFAST_CALLBACK_URL || "",
};
