import { ShoppingBag, Globe, MessageCircle, Share2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 relative mt-1">
      {/* Subtle top gradient line separating from newsletter */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="Cartify" className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(255,87,34,0.3)] transition-all group-hover:scale-105" />
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your premium destination for quality products across all categories. Shop with confidence on a trusted multi-vendor marketplace.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Globe, label: "Website" },
                { icon: MessageCircle, label: "Community" },
                { icon: Share2, label: "Share" },
                { icon: Mail, label: "Contact" }
              ].map((Social, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  whileHover={{ scale: 1.15 }}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-orange-600 shadow-sm"
                  aria-label={Social.label}
                >
                  <Social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-extrabold mb-6 text-orange-500 uppercase tracking-widest text-sm">Company</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><Link to="/about" className="hover:text-orange-400 transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-orange-400 transition-colors">Careers</Link></li>
              <li><Link to="/become-seller" className="hover:text-orange-400 transition-colors text-orange-400 font-bold">Sell on Cartify</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-extrabold mb-6 text-orange-500 uppercase tracking-widest text-sm">Help</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><Link to="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              <li><Link to="/track-order" className="hover:text-orange-400 transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-orange-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-extrabold mb-6 text-orange-500 uppercase tracking-widest text-sm">Legal</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-orange-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} Cartify Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-orange-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
