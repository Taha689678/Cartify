import { motion } from "framer-motion";

export const PromoBar = () => {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-blue-600 text-white py-3 px-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm font-medium text-center sm:text-left">
          Get 20% OFF on Your First Order!
        </p>
        <button className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
          Claim Offer
        </button>
      </div>
    </motion.div>
  );
};
