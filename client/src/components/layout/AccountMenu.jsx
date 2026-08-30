import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, ChevronDown, Package, Heart, MapPin, Key, LayoutDashboard, FileText, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export const AccountMenu = () => {
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="hidden md:block w-[164px] h-10" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
      >
        <User size={18} />
        Login / Register
      </Link>
    );
  }

  const isSeller = user.role === "seller" || user.role === "admin";
  const sellerStatus = user?.seller?.status || user.sellerStatus || "pending"; // Fallback if schema doesn't have it explicitly yet

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[100px] truncate">{user.name}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 mb-2">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>

            {user.role === "admin" && (
              <div className="px-2 mb-2">
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                  <LayoutDashboard size={18} />
                  Admin Panel
                </Link>
              </div>
            )}

            {isSeller && sellerStatus === "approved" && (
              <div className="px-2 mb-2">
                <Link to="/seller/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <LayoutDashboard size={18} />
                  Seller Dashboard
                </Link>
              </div>
            )}

            {isSeller && sellerStatus !== "approved" && (
              <div className="px-2 mb-2">
                <Link to="/become-seller" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                  <FileText size={18} />
                  Seller App: {sellerStatus.charAt(0).toUpperCase() + sellerStatus.slice(1)}
                </Link>
              </div>
            )}

            {!isSeller && user.role === "customer" && (
              <div className="px-2 mb-2">
                <Link to="/become-seller" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                  <Store size={18} />
                  Become a Seller
                </Link>
              </div>
            )}

            <div className="px-2 space-y-1 border-b border-gray-100 pb-2 mb-2">
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <User size={18} /> My Profile
              </Link>
              <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <Package size={18} /> My Orders
              </Link>
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <Heart size={18} /> My Wishlist
              </Link>
              <Link to="/addresses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <MapPin size={18} /> My Addresses
              </Link>
              <Link to="/settings/password" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <Key size={18} /> Change Password
              </Link>
            </div>

            <div className="px-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

