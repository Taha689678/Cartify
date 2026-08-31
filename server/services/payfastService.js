import crypto from "crypto";
import { payfastConfig } from "../config/payfast.js";

const generateSignature = (data, passPhrase = null) => {
  let pfOutput = "";
  for (const key in data) {
    if (data.hasOwnProperty(key) && data[key] !== "" && data[key] !== null) {
      pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, "+")}&`;
    }
  }

  let getString = pfOutput.slice(0, -1);
  if (passPhrase) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
};

export const initiatePayment = async (order, payment) => {
  if (!payfastConfig.enabled || !payfastConfig.merchantId) {
    // Sandbox / mock response
    return {
      success: true,
      checkoutUrl: `/payment/success?order_id=${order._id}`,
      token: "mock_token_123",
      paymentId: payment._id,
    };
  }

  // Construct PayFast payload
  const host = payfastConfig.environment === "production" 
    ? "www.payfast.co.za" 
    : "sandbox.payfast.co.za";
    
  const data = {
    merchant_id: payfastConfig.merchantId,
    merchant_key: payfastConfig.merchantKey,
    return_url: payfastConfig.returnUrl,
    cancel_url: payfastConfig.cancelUrl,
    notify_url: payfastConfig.notifyUrl,
    m_payment_id: payment._id.toString(),
    amount: order.totalAmount.toFixed(2),
    item_name: `Cartify Order ${order._id}`,
  };

  const signature = generateSignature(data, payfastConfig.passPhrase);
  data.signature = signature;

  const queryString = new URLSearchParams(data).toString();
  const checkoutUrl = `https://${host}/eng/process?${queryString}`;

  return {
    success: true,
    checkoutUrl,
    token: signature,
    paymentId: payment._id,
  };
};

export const verifySignature = (payload) => {
  if (!payfastConfig.enabled) {
    return true; // Mock verification
  }
  
  const providedSignature = payload.signature;
  const data = { ...payload };
  delete data.signature;
  
  const generatedSignature = generateSignature(data, payfastConfig.passPhrase);
  return providedSignature === generatedSignature;
};
