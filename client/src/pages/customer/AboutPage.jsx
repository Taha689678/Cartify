import React from 'react';
import { Link } from 'react-router-dom';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { Store, ShieldCheck, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutPage = () => {
  const stats = [
    { icon: <Store className="w-6 h-6 text-blue-600" />, label: 'Premium Sellers', value: '1,000+' },
    { icon: <Users className="w-6 h-6 text-blue-600" />, label: 'Happy Customers', value: '50,000+' },
    { icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, label: 'Secure Orders', value: '100%' },
    { icon: <Zap className="w-6 h-6 text-blue-600" />, label: 'Fast Delivery', value: '24/7' },
  ];

  return (
    <InfoPageLayout 
      title="About Cartify" 
      description="Your premier multi-vendor marketplace for high-quality products and seamless shopping experiences."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            At Cartify, we believe in connecting passionate creators, verified brands, and independent sellers directly with customers. 
            Our platform is designed to provide a secure, frictionless, and visually stunning e-commerce experience where quality meets convenience.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-100">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                {stat.icon}
              </div>
              <span className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</span>
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
          <ul className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Curated Selection:</strong> We carefully vet our sellers to ensure you only get the best products.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Buyer Protection:</strong> Every purchase is backed by our secure payment gateway and flexible return policy.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Empowering Sellers:</strong> By shopping here, you are supporting independent businesses and entrepreneurs.</span>
            </li>
          </ul>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center items-center">
          <Link 
            to="/shop" 
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center shadow-md shadow-blue-200"
          >
            Start Shopping
          </Link>
          <Link 
            to="/become-seller" 
            className="w-full sm:w-auto px-8 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-blue-600 transition-colors text-center"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
};

