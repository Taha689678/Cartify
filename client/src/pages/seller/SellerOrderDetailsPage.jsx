import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';

export const SellerOrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await sellerApi.getOrder(id);
      setOrder(res.data?.data?.order || res.data?.order || res.data?.data || null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      setUpdating(true);
      await sellerApi.updateOrderItemStatus(id, itemId, newStatus);
      // Refresh order data
      await fetchOrderDetails();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update item status');
    } finally {
      setUpdating(false);
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

  if (loading && !updating) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  const ITEM_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/seller/orders" className="text-gray-500 hover:text-gray-700">
          &larr; Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Order Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">Rs {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="font-medium capitalize">{order.paymentStatus || 'Pending'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Customer Info</h2>
          {order.shippingAddress ? (
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-gray-600">Phone: {order.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No shipping address provided</p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Order Items</h2>
          {updating && <span className="text-sm text-blue-600 animate-pulse">Updating...</span>}
        </div>
        
        <div className="divide-y">
          {order.items?.map((item) => (
            <div key={item._id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0].url || item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </div>
              
              <div className="flex-1">
                <Link to={`/products/${item.product?._id}`} className="font-medium hover:text-blue-600 line-clamp-1">
                  {item.product?.name || 'Unknown Product'}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  Qty: {item.quantity} × ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(item.itemStatus)}`}>
                  {item.itemStatus || 'Pending'}
                </span>
                
                <select
                  disabled={updating}
                  value={item.itemStatus || 'Pending'}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  className="border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  {ITEM_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
