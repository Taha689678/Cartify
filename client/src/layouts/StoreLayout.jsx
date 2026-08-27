import { Outlet } from "react-router-dom";
import { PromoBar } from "../components/layout/PromoBar.jsx";
import { Navbar } from "../components/layout/Navbar.jsx";
import { Footer } from "../components/layout/Footer.jsx";

export const StoreLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PromoBar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

