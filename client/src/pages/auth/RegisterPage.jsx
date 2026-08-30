import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle } from "lucide-react";
import logo from "../../assets/logo.jpeg";
import { useForm } from "../../hooks/useForm.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";

export const RegisterPage = () => {
  const { register, error: authError, clearError, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { values, errors, handleChange, validateForm } = useForm(
    { name: "", username: "", email: "", password: "", phone: "" },
    (values) => {
      const errors = {};

      const name = values.name.trim();
      const username = values.username.trim();
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      if (!name) {
        errors.name = "Name is required";
      } else if (name.length < 2 || name.length > 50) {
        errors.name = "Name must be between 2 and 50 characters long";
      }

      if (!username) {
        errors.username = "Username is required";
      } else if (username.length < 3 || username.length > 30) {
        errors.username = "Username must be between 3 and 30 characters long";
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = "Username can only contain letters, numbers, and underscores";
      }

      if (!email) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!password) {
        errors.password = "Password is required";
      } else if (password.length < 8 || password.length > 128) {
        errors.password = "Password must be between 8 and 128 characters long";
      } else if (/\s/.test(password)) {
        errors.password = "Password cannot contain spaces";
      } else if (!/[a-z]/.test(password)) {
        errors.password = "Password must include at least one lowercase letter";
      } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password must include at least one uppercase letter";
      } else if (!/\d/.test(password)) {
        errors.password = "Password must include at least one number";
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = "Password must include at least one special character";
      } else {
        const passwordLower = password.toLowerCase();
        const identityFragments = [
          name.toLowerCase(),
          username.toLowerCase(),
          email.split("@")[0],
        ].filter((fragment) => fragment.length > 2);

        if (identityFragments.some((fragment) => passwordLower.includes(fragment))) {
          errors.password = "Password cannot contain your name, username, or email";
        }
      }

      if (values.phone && !/^[0-9+\-\s()]{7,20}$/.test(values.phone.trim())) {
        errors.phone = "Please enter a valid phone number";
      }

      return errors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitError(null);
    setSuccessMessage(null);

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await register(values);
        setSuccessMessage(
          "Registration successful! Please check your email to verify your account."
        );
        // Do not auto-authenticate - user must verify email first
      } catch (error) {
        setSubmitError(authError || error.response?.data?.message || "Registration failed");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const displayError = submitError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4"><img src={logo} alt="Cartify" className="h-16 w-auto mx-auto" /></Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Cartify today</p>
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

        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
          >
            {displayError}
          </motion.div>
        )}

        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isSubmitting || authLoading}
              placeholder="John Doe"
            />
            <Input
              label="Username"
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              error={errors.username}
              disabled={isSubmitting || authLoading}
              placeholder="johndoe"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting || authLoading}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting || authLoading}
              showPasswordToggle={true}
              placeholder="••••••••"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={isSubmitting || authLoading}
              placeholder="+1 234 567 8900"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting || authLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Go to Login
          </Button>
        )}

        {!successMessage && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

