import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { authApi } from "../../api/authApi.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your email link.");
      setShowResend(true);
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (verificationToken) => {
    try {
      await authApi.verifyEmail(verificationToken);
      setStatus("success");
      setMessage("Email verified successfully! You can now log in.");
    } catch (error) {
      setStatus("error");
      const errorMessage = error.response?.data?.message || "Verification failed";
      setMessage(errorMessage);
      setShowResend(true);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setIsResending(true);
    setResendMessage("");

    try {
      await authApi.resendVerificationEmail({ email: resendEmail });
      setResendMessage("If an account with that email exists and is unverified, a verification email has been sent.");
      setStatus("success");
    } catch (error) {
      setResendMessage(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ShoppingBag className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600">Verify your email address</p>
        </div>

        {status === "loading" && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {message}
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {message}
              </div>
            </div>

            {showResend && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="text-gray-500" size={20} />
                  <p className="text-sm text-gray-600">
                    Request a new verification email:
                  </p>
                </div>
                <form onSubmit={handleResend} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isResending}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isResending || !resendEmail}
                  >
                    {isResending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </form>

                {resendMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl text-sm ${
                      resendMessage.includes("sent")
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {resendMessage}
                  </motion.div>
                )}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Back to Login
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
