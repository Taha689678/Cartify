import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "../../hooks/useCategories.js";

export const CategoryMegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use the existing hook to fetch categories automatically
  const { categories, loading } = useCategories({ limit: 12 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 border border-gray-200"
      >
        <Grid size={20} />
        <span>Categories</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ml-1 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 grid grid-cols-3 gap-x-8 gap-y-4"
          >
            {loading ? (
              // Skeletons
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 group transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-blue-100 group-hover:shadow-sm transition-all overflow-hidden text-2xl">
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400 group-hover:text-blue-500">
                        {cat.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No categories found.
              </div>
            )}
            
            <div className="col-span-3 border-t border-gray-100 pt-4 mt-2">
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex justify-center w-full hover:underline"
              >
                Browse All Categories & Products &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
