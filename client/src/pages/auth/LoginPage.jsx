import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import logo from "../../assets/logo.jpeg";
import { useForm } from "../../hooks/useForm.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";

export const LoginPage = () => {
  const { login, error: authError, clearError, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { values, errors, handleChange, validateForm } = useForm(
    { email: "", password: "" },
    (values) => {
      const errors = {};
      if (!values.email) errors.email = "Email is required";
      if (!values.password) errors.password = "Password is required";
      return errors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitError(null);

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await login(values);
        navigate("/");
      } catch (error) {
        setSubmitError(authError || error.response?.data?.message || "Login failed");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Cartify</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
          >
            {displayError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div>
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
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting || authLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};


