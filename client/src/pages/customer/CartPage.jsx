import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export const CartPage = () => {
  const { cart, loading, error, subtotal, cartItemCount, updateQuantity, removeItem, clearCart } = useCart();

  if (loading && (!cart || !cart.items)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/shop" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block w-full">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-lg">Browse our products and add something you love.</p>
          <Link to="/shop" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart <span className="text-gray-400 text-xl font-medium ml-2">({cartItemCount} items)</span></h1>
          <button 
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {cart.items.map((item) => {
                const product = item.product;
                const imageSrc = product.images?.[0]?.url;
                const currentPrice = item.price || product.price;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 relative"
                  >
                    {/* Image */}
                    <Link to={`/product/${product.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link to={`/product/${product.slug}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                            {product.name}
                          </Link>
                          {product.seller?.storeName && (
                            <p className="text-sm text-gray-500 mt-1">Sold by {product.seller.storeName}</p>
                          )}
                          <p className="text-lg font-bold text-gray-900 mt-2">${currentPrice.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(product._id)}
                          className="text-gray-400 hover:text-red-500 p-2 -mr-2 -mt-2 self-start transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-1">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock || loading}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-lg font-bold text-blue-600">${(currentPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItemCount} items)</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-blue-600">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                onClick={() => alert("Checkout module coming soon!")}
              >
                Proceed to Checkout
              </button>

              <Link to="/shop" className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
