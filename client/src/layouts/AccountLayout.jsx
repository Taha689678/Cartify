import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { User, Heart, ShoppingBag, LogOut, Settings, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "My Profile", path: "/profile", icon: <User size={20} /> },
    { name: "My Addresses", path: "/addresses", icon: <MapPin size={20} /> },
    { name: "My Orders", path: "/orders", icon: <ShoppingBag size={20} /> },
    { name: "My Wishlist", path: "/wishlist", icon: <Heart size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "?"}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 line-clamp-1">{user?.name || user?.username}</h2>
                <p className="text-sm text-gray-500 line-clamp-1">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/profile"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left mt-4"
              >
                <LogOut size={20} />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
