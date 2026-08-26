import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/customer/HomePage";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <HomePage />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;