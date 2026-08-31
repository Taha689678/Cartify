import React from 'react';
import { motion } from 'framer-motion';

export const InfoPageLayout = ({ title, description, children }) => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">{title}</h1>
          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

