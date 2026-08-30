import dotenv from "dotenv";
dotenv.config();

export const payfastConfig = {
  enabled: process.env.PAYFAST_ENABLED === "true",
  environment: process.env.PAYFAST_ENVIRONMENT || "sandbox",
  merchantId: process.env.PAYFAST_MERCHANT_ID || "",
  secureKey: process.env.PAYFAST_SECURE_KEY || "",
  returnUrl: process.env.PAYFAST_RETURN_URL || "",
  callbackUrl: process.env.PAYFAST_CALLBACK_URL || "",
};
