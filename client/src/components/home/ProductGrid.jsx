import { motion } from "framer-motion";
import { ProductCard, ProductCardSkeleton } from "./ProductCard.jsx";
import { PackageX, AlertCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const ProductGrid = ({ 
  title, 
  products, 
  showMore = false, 
  loading = false, 
  error = null, 
  onRetry = null,
  emptyTitle = "No products found",
  emptyMessage = "We couldn't find any products matching this section right now. Please check back later!",
  emptyAction = null
}) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showMore && products && products.length > 0 && !loading && !error && (
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View more
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
            <p className="text-gray-500 mb-4 max-w-md">{error}</p>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <PackageX className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyTitle}</h3>
            <p className="text-gray-500 max-w-md mb-6">{emptyMessage}</p>
            {emptyAction}
          </div>
        )}
      </div>
    </section>
  );
};
