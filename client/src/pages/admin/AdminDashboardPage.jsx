import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  MessageSquare,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { motion } from "framer-motion";

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashRes, statsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getStatistics()
        ]);
        setData(dashRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const kpis = [
    { title: "Total Revenue", value: `$${(data?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Orders", value: data?.totalOrders || 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Users", value: data?.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total Sellers", value: data?.totalSellers || 0, icon: Store, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Active Products", value: data?.activeProducts || 0, icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Pending Orders", value: data?.pendingOrders || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { title: "Delivered Orders", value: data?.deliveredOrders || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Total Reviews", value: data?.totalReviews || 0, icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Top Products by Sales
            </h2>
            <Link to="/admin/products" className="text-sm text-red-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {stats?.topProducts?.length > 0 ? (
              stats.topProducts.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-1">{prod.productName || "Unknown Product"}</p>
                    <p className="text-sm text-gray-500">{prod.totalSold} sold</p>
                  </div>
                  <div className="font-semibold text-gray-900">${(prod.totalRevenue || 0).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data yet.</p>
            )}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-red-600" />
              Top Sellers by Revenue
            </h2>
            <Link to="/admin/sellers" className="text-sm text-red-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {stats?.topSellers?.length > 0 ? (
              stats.topSellers.map((seller, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{seller.storeName || "Unknown Store"}</p>
                    <p className="text-sm text-gray-500">{seller.totalSold} items sold</p>
                  </div>
                  <div className="font-semibold text-gray-900">${(seller.totalRevenue || 0).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
