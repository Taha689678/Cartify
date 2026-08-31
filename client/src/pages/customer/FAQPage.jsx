import React, { useState } from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Orders & Shipping",
      items: [
        { q: "How long does shipping take?", a: "Shipping times vary depending on the seller and your location. Standard shipping typically takes 3-7 business days, while expedited shipping takes 1-3 business days. You can see specific estimates at checkout." },
        { q: "Do you ship internationally?", a: "Currently, our marketplace primarily serves domestic customers. However, some individual sellers may offer international shipping options on their specific listings." },
        { q: "Can I modify my order after placing it?", a: "Because sellers begin processing orders immediately, modifications are generally not possible. However, you can attempt to cancel the order within 1 hour of placement from your Orders dashboard." }
      ]
    },
    {
      category: "Returns & Payments",
      items: [
        { q: "What payment methods do you accept?", a: "We accept only payfast integrations like easypaisa and jazzcash for online payments." },
        { q: "When will I get my refund?", a: "Refunds are processed within 5-10 business days after the returned item has been received and inspected by the seller." }
      ]
    },
    {
      category: "Selling on Cartify",
      items: [
        { q: "How do I become a seller?", a: "You can apply to become a seller by clicking the 'Sell on Cartify' link in the footer or Account Menu. You'll need to provide your business details and agree to our seller terms." },
        { q: "What are the seller fees?", a: "Cartify takes a small commission fee on successful sales. The exact percentage depends on the product category. There are no upfront listing fees." }
      ]
    }
  ];

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <InfoPageLayout title="Frequently Asked Questions" description="Find answers to common questions about buying, selling, and managing your account on Cartify.">
      <div className="space-y-10">
        {faqs.map((section, secIdx) => (
          <div key={secIdx}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item) => {
                const currentIndex = globalIndex++;
                const isOpen = openIndex === currentIndex;
                
                return (
                  <div key={currentIndex} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => toggleOpen(currentIndex)}
                      className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <span>{item.q}</span>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-4 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
};

