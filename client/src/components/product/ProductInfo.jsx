import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Minus, Plus, Heart, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const rating = product.rating || 0;
  const reviews = product.numReviews || 0;
  const inStock = product.stock > 0;

  const handleQuantityChange = (delta) => {
    const newQ = quantity + delta;
    if (newQ >= 1 && newQ <= product.stock) {
      setQuantity(newQ);
    }
  };

  const handleManualInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > product.stock) val = product.stock;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    
    setAdding(true);
    setError(null);
    setSuccess(false);
    
    try {
      await addToCart(product._id, quantity);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.message === "unauthenticated") {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || "Failed to add to cart");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.categories.map(cat => (
              <span key={cat._id} className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className={i < Math.floor(rating) ? "fill-current" : "text-gray-300"} />
            ))}
          </div>
          <span className="text-gray-500 font-medium">({reviews} reviews)</span>
        </div>
      </div>

      <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
        <span className="text-4xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
        {product.compareAtPrice > product.price && (
          <>
            <span className="text-xl text-gray-400 line-through mb-1">${product.compareAtPrice?.toFixed(2)}</span>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded mb-1">
              Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </span>
          </>
        )}
      </div>

      <div className="py-2">
        <div className="flex items-center gap-2 mb-4">
          {inStock ? (
            <>
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-medium text-green-600">In Stock</span>
              {product.stock <= 5 && (
                <span className="text-sm text-orange-500 ml-2 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                  Only {product.stock} left!
                </span>
              )}
            </>
          ) : (
            <>
              <AlertCircle size={20} className="text-red-500" />
              <span className="font-medium text-red-600">Out of Stock</span>
            </>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 mt-auto">
        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} /> Added to cart successfully!
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-white w-full sm:w-32 flex-shrink-0">
            <button 
              onClick={() => handleQuantityChange(-1)} 
              disabled={!inStock || quantity <= 1 || adding}
              className="text-gray-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
            >
              <Minus size={20} />
            </button>
            <input 
              type="number" 
              value={quantity} 
              onChange={handleManualInput}
              disabled={!inStock || adding}
              className="w-12 text-center font-bold text-gray-900 bg-transparent focus:outline-none focus:ring-0 disabled:opacity-50" 
              min="1" 
              max={product.stock} 
            />
            <button 
              onClick={() => handleQuantityChange(1)} 
              disabled={!inStock || quantity >= product.stock || adding}
              className="text-gray-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <motion.button 
            onClick={handleAddToCart}
            whileTap={inStock && !adding ? { scale: 0.98 } : {}}
            disabled={!inStock || adding}
            className={`flex-1 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
              success ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            } text-white`}
          >
            {adding ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
            {adding ? 'Adding...' : success ? 'Added' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </motion.button>

          <button className="p-3 border border-gray-300 rounded-xl text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex-shrink-0">
            <Heart size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
