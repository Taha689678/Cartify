import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const WishlistPage = () => {
  const { wishlistItems, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (item) => {
    if (item.product.stock > 0) {
      try {
        await addToCart(item.product._id, 1);
      } catch (err) {
        if (err.message === "unauthenticated") {
          navigate('/login');
        } else {
          console.error("Failed to add to cart:", err);
        }
      }
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-64 border border-gray-100">
              <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="font-semibold hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
          <Heart size={40} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Save products you love and find them here later.
        </p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <ArrowLeft size={20} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        <button
          onClick={clearWishlist}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium self-start sm:self-auto"
        >
          <Trash2 size={18} />
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          if (!product) return null; // Safe guard for deleted products

          const imageSrc = product.images && product.images.length > 0 ? product.images[0].url : null;
          const inStock = product.stock > 0;

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group flex flex-col h-full border border-gray-100 relative"
            >
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
                title="Remove from Wishlist"
              >
                <XIcon size={18} />
              </button>

              <div className="relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">
                  {imageSrc ? (
                    <img src={imageSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
                  )}
                </Link>
                {!inStock && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-white px-4 py-2 rounded-full font-bold text-red-500 shadow-sm border border-red-100">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product.slug}`} className="hover:text-blue-600 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                </Link>
                
                <div className="flex items-center gap-2 mt-auto pt-4">
                  <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2)}</span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">${product.compareAtPrice?.toFixed(2)}</span>
                  )}
                </div>

                <div className="mt-4">
                  {inStock ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 font-bold py-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Helper component since lucide-react has X
const XIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
