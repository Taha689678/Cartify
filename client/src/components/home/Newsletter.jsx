import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { newsletterApi } from "../../api/newsletterApi.js";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await newsletterApi.subscribe(email);
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
      setErrorMessage("Failed to subscribe. Please try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 to-orange-700 relative overflow-hidden"
    >
      {/* Decorative radial glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stay Updated</h2>
        <p className="text-orange-100 mb-10 text-lg">
          Subscribe to our newsletter for exclusive offers and new product updates.
        </p>

        {status === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium max-w-xl mx-auto mb-6">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto relative p-1 bg-white/10 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
          <div className="flex-grow relative flex items-center">
            <Mail className="absolute left-6 text-white/70" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-14 pr-6 py-4 rounded-full bg-transparent text-white placeholder-orange-100/70 focus:outline-none focus:ring-0 text-base"
              required
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex-shrink-0 bg-gray-900 text-white px-8 py-4 sm:py-0 rounded-full font-semibold hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[160px] disabled:opacity-70"
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.span 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={20} className="text-green-400" />
                  Subscribed!
                </motion.span>
              ) : status === "loading" ? (
                <motion.span 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </motion.span>
              ) : (
                <motion.span 
                  key="default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  Get Updates <ArrowRight size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>
      </div>
    </motion.section>
  );
};
