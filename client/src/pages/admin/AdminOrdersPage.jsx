import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { ShoppingCart, Eye, Calendar, DollarSign } from "lucide-react";

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const res = await adminApi.getOrders(params);
      setOrders(res.data.data.orders);
      setTotalPages(res.data.meta?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, page]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50 px-2 py-1 rounded';
      case 'pending': return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded';
      case 'failed': return 'text-red-600 bg-red-50 px-2 py-1 rounded';
      case 'refunded': return 'text-gray-600 bg-gray-50 px-2 py-1 rounded';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-start">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-gray-400 w-5 h-5" />
          <span className="text-gray-600 font-medium">Order Status:</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <div className="flex items-center gap-2 ml-0 sm:ml-4">
          <DollarSign className="text-gray-400 w-5 h-5" />
          <span className="text-gray-600 font-medium">Payment:</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Order Details</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Order Status</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders found</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-xs text-gray-500 mb-1">#{order._id}</div>
                      <div className="flex items-center text-sm text-gray-600 gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">${(order.totalAmount || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      <span className={getPaymentColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-gray-300 rounded text-sm bg-white disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-300 rounded text-sm bg-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
