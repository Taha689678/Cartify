import { motion } from "framer-motion";
import { Truck, ShieldCheck, Award } from "lucide-react";

export const Specifications = () => {
  const specs = [
    {
      id: 1,
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over Rs 5000",
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "100% secure payment processing",
    },
    {
      id: 3,
      icon: Award,
      title: "Quality Products",
      description: "Handpicked premium quality items",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.id}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{spec.title}</h3>
                <p className="text-gray-600">{spec.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
