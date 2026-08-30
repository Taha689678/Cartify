import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';

export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await sellerApi.getOrders();
      setOrders(res.data?.data?.orders || res.data?.orders || (Array.isArray(res.data?.data) ? res.data.data : []));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-10 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-500">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus || 'Pending'}
                  </span>
                </div>
                <Link
                  to={`/seller/orders/${order._id}`}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
              
              <div className="p-4">
                <p className="font-medium mb-3 text-gray-700">Items in this order:</p>
                <div className="divide-y">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0].url || item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(item.itemStatus)}`}>
                          {item.itemStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
