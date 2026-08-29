import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { orderApi } from '../../api/orderApi.js';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrders();
        setOrders(res.data.data.orders || res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-gray-50 rounded-2xl border border-gray-100 p-5 h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center h-64">
        <AlertCircle size={40} className="mb-4 text-red-400" />
        <h3 className="text-lg font-bold mb-2">Error Loading Orders</h3>
        <p className="mb-6 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">View and manage your recent orders.</p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 border border-gray-100">
              <ShoppingBag size={38} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Looks like you haven't made any purchases yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Order #{order._id.substring(0, 8)}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.paymentStatus?.toUpperCase() || 'UNPAID'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900">${(order.totalAmount || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-100 hover:text-blue-600 transition-colors border border-gray-200"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
