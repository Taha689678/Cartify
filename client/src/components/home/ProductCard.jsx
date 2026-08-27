import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";

export const ProductCard = ({ product }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl">
          {product.image || "📦"}
        </div>
        
        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
            <Eye size={20} />
          </button>
          <button className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
            <Heart size={20} />
          </button>
        </motion.div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">({product.reviews || 24})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">${product.price}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">${product.oldPrice}</span>
            )}
          </div>
          <button className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
