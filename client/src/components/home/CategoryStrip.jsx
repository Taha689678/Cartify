import { motion } from "framer-motion";
import { Headphones, Watch, Mouse, Camera, Laptop, Smartphone, Gamepad2 } from "lucide-react";

export const CategoryStrip = () => {
  const categories = [
    { id: 1, name: "Headphones", icon: Headphones },
    { id: 2, name: "Watches", icon: Watch },
    { id: 3, name: "Mouse", icon: Mouse },
    { id: 4, name: "Camera", icon: Camera },
    { id: 5, name: "Laptops", icon: Laptop },
    { id: 6, name: "Phones", icon: Smartphone },
    { id: 7, name: "Gaming", icon: Gamepad2 },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.08 }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow min-w-[120px] snap-start"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Icon size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
