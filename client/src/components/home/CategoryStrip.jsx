import { motion } from "framer-motion";
import { Headphones, Watch, Mouse, Camera, Laptop, Smartphone, Gamepad2, Tag, AlertCircle } from "lucide-react";
import { useCategories } from "../../hooks/useCategories.js";

// Helper to map category names to icons if no image is provided
const getIconForCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes("headphone") || n.includes("audio")) return Headphones;
  if (n.includes("watch") || n.includes("wearable")) return Watch;
  if (n.includes("mouse") || n.includes("keyboard")) return Mouse;
  if (n.includes("camera") || n.includes("photo")) return Camera;
  if (n.includes("laptop") || n.includes("computer")) return Laptop;
  if (n.includes("phone") || n.includes("mobile")) return Smartphone;
  if (n.includes("game") || n.includes("gaming")) return Gamepad2;
  return Tag; // Default
};

export const CategoryStrip = () => {
  const { categories, loading, error, refetch } = useCategories();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse Categories</h2>
        
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm min-w-[120px] animate-pulse border border-gray-100">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
             <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
             <p className="text-sm text-gray-600 mb-3">{error}</p>
             <button onClick={refetch} className="text-sm text-blue-600 font-medium hover:underline">Retry</button>
           </div>
        ) : categories && categories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {categories.map((category) => {
              const Icon = getIconForCategory(category.name);
              const imageUrl = category.image?.url;
              
              return (
                <motion.button
                  key={category._id}
                  whileHover={{ scale: 1.05 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow min-w-[120px] snap-start"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon size={24} className="text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    {category.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
           <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
             <p className="text-gray-500">No categories available.</p>
           </div>
        )}
      </div>
    </section>
  );
};
