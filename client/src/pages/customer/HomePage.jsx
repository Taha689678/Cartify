import { Hero } from "../../components/home/Hero.jsx";
import { PromoCards } from "../../components/home/PromoCards.jsx";
import { CategoryStrip } from "../../components/home/CategoryStrip.jsx";
import { ProductGrid } from "../../components/home/ProductGrid.jsx";
import { Specifications } from "../../components/home/Specifications.jsx";
import { Newsletter } from "../../components/home/Newsletter.jsx";

// Placeholder product data
const latestProducts = [
  { id: 1, name: "Wireless Headphones Pro", price: 299, oldPrice: 349, rating: 4.5, reviews: 128, image: "🎧" },
  { id: 2, name: "Smart Watch Series X", price: 449, rating: 4.8, reviews: 256, image: "⌚" },
  { id: 3, name: "Ergonomic Mouse", price: 79, rating: 4.3, reviews: 89, image: "🖱️" },
  { id: 4, name: "USB-C Hub Pro", price: 59, oldPrice: 79, rating: 4.6, reviews: 167, image: "🔌" },
];

const bestSellingProducts = [
  { id: 5, name: "Bluetooth Speaker", price: 129, rating: 4.7, reviews: 312, image: "🔊" },
  { id: 6, name: "Laptop Stand", price: 45, rating: 4.4, reviews: 98, image: "💻" },
  { id: 7, name: "Wireless Charger", price: 35, rating: 4.5, reviews: 145, image: "🔋" },
  { id: 8, name: "Webcam HD", price: 89, rating: 4.6, reviews: 203, image: "📷" },
  { id: 9, name: "Mechanical Keyboard", price: 159, rating: 4.8, reviews: 421, image: "⌨️" },
  { id: 10, name: "Gaming Mouse Pad", price: 25, rating: 4.3, reviews: 76, image: "🎮" },
  { id: 11, name: "Monitor Light Bar", price: 65, rating: 4.4, reviews: 112, image: "💡" },
  { id: 12, name: "Desk Organizer", price: 39, rating: 4.2, reviews: 67, image: "🗂️" },
];

export const HomePage = () => {
  return (
    <div>
      <Hero />
      <PromoCards />
      <CategoryStrip />
      <ProductGrid title="Latest Products" products={latestProducts} showMore={true} />
      <ProductGrid title="Best Selling" products={bestSellingProducts} showMore={true} />
      <Specifications />
      <Newsletter />
    </div>
  );
};
