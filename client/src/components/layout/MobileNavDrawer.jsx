import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, User, LogOut, Package, LayoutDashboard, Grid, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useCategories } from "../../hooks/useCategories.js";

export const MobileNavDrawer = ({ isOpen, onClose }) => {
  const { user, loading, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { categories } = useCategories({ limit: 10 });

  const isSeller = user?.role === "seller" || user?.role === "admin";
  const sellerStatus = user?.sellerStatus || "pending";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-y-0 right-0 w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 flex flex-col h-full overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-xl text-gray-900">Menu</span>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Summary */}
            {loading ? (
              <div className="p-4 h-[88px] border-b border-gray-100" aria-hidden="true" />
            ) : user ? (
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                {isSeller && sellerStatus === "approved" && (
                  <Link to="/seller/dashboard" onClick={onClose} className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                    <LayoutDashboard size={14} /> Seller Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-4 border-b border-gray-100">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm shadow-blue-200"
                >
                  <User size={18} /> Login or Register
                </Link>
              </div>
            )}

            {/* Main Links */}
            <div className="py-2 flex-1">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Browse
              </div>
              <Link to="/" onClick={onClose} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                Home
              </Link>
              <Link to="/shop" onClick={onClose} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                Shop All
              </Link>

              {categories.length > 0 && (
                <>
                  <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Grid size={14} /> Top Categories
                  </div>
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    >
                      {cat.image ? (
                        <img src={cat.image} alt="" className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">📦</div>
                      )}
                      {cat.name}
                    </Link>
                  ))}
                </>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    My Account
                  </div>
                  <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                    <User size={18} /> Profile
                  </Link>
                  <Link to="/cart" onClick={onClose} className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                    <div className="flex items-center gap-3"><ShoppingBag size={18} /> Cart</div>
                    {cartItemCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{cartItemCount}</span>}
                  </Link>
                  <Link to="/wishlist" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                    <Heart size={18} /> Wishlist
                  </Link>
                  <Link to="/orders" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                    <Package size={18} /> Orders
                  </Link>
                  <Link to="/addresses" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium">
                    <MapPin size={18} /> Addresses
                  </Link>
                </>
              )}
            </div>

            {/* Logout */}
            {user && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
