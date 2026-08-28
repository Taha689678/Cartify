import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { Header } from "./components/layout/Header.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Temporary Tailwind test - remove after verification */}
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;