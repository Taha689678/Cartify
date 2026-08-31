import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const PromoCards = () => {
  const cards = [
    {
      id: 1,
      title: "Best Products",
      description: "Discover our top-rated items",
      bgColor: "from-blue-500 to-blue-600",
      image: "🎁",
    },
    {
      id: 2,
      title: "20% Discounts",
      description: "Limited time offers available",
      bgColor: "from-purple-500 to-purple-600",
      image: "🏷️",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white [perspective:1000px]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50, rotateX: -10, z: -100 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                scale: 1.03, 
                y: -6, 
                rotateX: 2, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
              }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.bgColor} text-white p-8 md:p-12 shadow-xl transform-gpu`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{card.title}</h3>
                  <p className="text-white/80 text-lg mb-8 max-w-xs">{card.description}</p>
                </div>
                <button className="self-start flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-full font-semibold transition-colors">
                  Shop Now <ArrowRight size={18} />
                </button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 text-[150px] leading-none transform translate-x-4 translate-y-10 group-hover:scale-110 transition-transform duration-700">
                {card.image}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

