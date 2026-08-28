import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageX } from 'lucide-react';

export const ProductGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <PackageX className="w-24 h-24 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || `${productName} - Image ${activeIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={img.publicId || idx}
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === idx ? 'border-blue-600 shadow-md scale-105' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
