import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle, Lock } from "lucide-react";
import { useForm } from "../../hooks/useForm.js";
import { authApi } from "../../api/authApi.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { values, errors, handleChange, validateForm } = useForm(
    { email: "" },
    (values) => {
      const errors = {};
      if (!values.email) errors.email = "Email is required";
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Invalid email format";
      }
      return errors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await authApi.forgotPassword({ email: values.email });
        setSuccessMessage(
          "If an account with that email exists, a password reset link has been sent."
        );
      } catch (error) {
        setSubmitError(error.response?.data?.message || "Failed to send reset email");
      } finally {
        setIsSubmitting(false);
      }
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
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-3"
          >
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
          >
            {submitError}
          </motion.div>
        )}

        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            Remember your password? Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
