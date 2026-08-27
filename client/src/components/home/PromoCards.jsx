import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const PromoCards = () => {
  const cards = [
    {
      id: 1,
      title: "Best Products",
      description: "Discover our top-rated items",
      bgColor: "from-blue-500 to-blue-600",
      image: "🎧",
    },
    {
      id: 2,
      title: "20% Discounts",
      description: "Limited time offers available",
      bgColor: "from-purple-500 to-purple-600",
      image: "🎁",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgColor} p-8 text-white shadow-lg`}
            >
              <div className="relative z-10">
                <div className="text-6xl mb-4">{card.image}</div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/90 mb-6">{card.description}</p>
                <button className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  View more
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
