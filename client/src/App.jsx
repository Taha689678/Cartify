import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { ScrollToTop } from "./components/layout/ScrollToTop.jsx";
import { CustomCursor } from "./components/layout/CustomCursor.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
            <CustomCursor />
            <div className="flex flex-col min-h-screen bg-gray-50">
              <main className="flex-grow">
                <AppRoutes />
              </main>
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

