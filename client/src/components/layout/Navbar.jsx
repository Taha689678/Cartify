import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, ShoppingCart, Heart, Search } from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { CategoryMegaMenu } from "./CategoryMegaMenu.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { AccountMenu } from "./AccountMenu.jsx";
import { MobileNavDrawer } from "./MobileNavDrawer.jsx";
import logo from "../../assets/logo.jpeg";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItemCount } = useCart();
  const { wishlistItemCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearchTerm.trim())}`);
      setMobileSearchTerm("");
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm py-2"
            : "bg-white py-3 border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* 1. Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Cartify" className="h-8 w-auto" />
            </Link>

            {/* 2. Category Mega Menu */}
            <div className="ml-8 hidden md:block">
              <CategoryMegaMenu />
            </div>

            {/* 3. Search Bar (Desktop) */}
            <SearchBar />

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-6 flex-shrink-0 ml-auto">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Search size={24} />
              </button>

              {/* 4. Wishlist Icon */}
              <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-red-500 transition-colors hidden sm:block">
                <Heart size={24} />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                  </span>
                )}
              </Link>

              {/* 5. Cart Icon */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* 6. Account Menu */}
              <AccountMenu />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors ml-1"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
          
          {/* Mobile Search Expandable Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden pt-3 pb-1 w-full animate-in slide-in-from-top-2">
              <form onSubmit={handleMobileSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mobileSearchTerm}
                  onChange={(e) => setMobileSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      <MobileNavDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};


