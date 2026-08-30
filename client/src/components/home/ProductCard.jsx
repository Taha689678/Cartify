import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export const ProductCard = ({ product }) => {
  const imageSrc = product.images && product.images.length > 0 ? product.images[0].url : null;
  const rating = product.rating || 0;
  const reviews = product.numReviews || 0;
  const compareAtPrice = product.compareAtPrice;
  
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const isSaved = isInWishlist(product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigating to ProductDetails
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }
    
    setWishlistLoading(true);
    try {
      if (isSaved) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist error", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group flex flex-col h-full relative"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl text-gray-400">
              📦
            </div>
          )}
        </Link>
        
        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <Link to={`/product/${product.slug}`} className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors pointer-events-auto" title="Quick View">
            <Eye size={20} />
          </Link>
          <button 
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors pointer-events-auto" 
            title="Add to Wishlist"
          >
            {wishlistLoading ? <Loader2 size={20} className="animate-spin text-gray-500" /> : <Heart size={20} className={isSaved ? "fill-red-500 text-red-500" : ""} />}
          </button>
        </motion.div>

        {/* Wishlist Button (Top Right) */}
        <button 
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors z-10" 
          title="Add to Wishlist"
        >
          {wishlistLoading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <Heart size={18} className={isSaved ? "fill-red-500 text-red-500" : ""} />}
        </button>
        
        {/* Stock status badge */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
           <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md pointer-events-none z-10">
             Only {product.stock} left
           </div>
        )}
        {product.stock === 0 && (
           <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md pointer-events-none z-10">
             Out of Stock
           </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.slug}`} className="hover:text-blue-600 transition-colors">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={product.name}>{product.name}</h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2 mt-auto">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-gray-900">Rs {product.price?.toFixed(2)}</span>
            {compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">Rs {compareAtPrice?.toFixed(2)}</span>
            )}
          </div>
          <button 
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
            disabled={product.stock === 0}
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-pulse border border-gray-100">
      <div className="aspect-square bg-gray-200 flex-shrink-0"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="flex gap-1 mb-3 mt-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-9 w-9 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
