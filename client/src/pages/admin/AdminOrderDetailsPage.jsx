import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";

export const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getOrder(id);
        setOrder(res.data.data.order);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await adminApi.updateOrderStatus(id, newStatus);
      setOrder(res.data.data.order);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setStatusUpdating(false);
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
    return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error || "Order not found"}</div>
        <button onClick={() => navigate('/admin/orders')} className="text-blue-600 hover:underline">Back to Orders</button>
      </div>
    );
  }

  const { shippingAddress, user, totals } = order;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order #{order._id}</h1>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <span className="font-medium text-gray-700">Update Order Status:</span>
        <select
          value={order.orderStatus}
          onChange={(e) => handleStatusUpdate(e.target.value)}
          disabled={statusUpdating || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-900">
              <Package className="w-5 h-5 text-gray-500" />
              Order Items ({order.items.length})
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <p>Product ID: <span className="font-mono">{item.product}</span></p>
                      <p>Seller ID: <span className="font-mono">{item.seller}</span></p>
                      <p className="mt-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(item.itemStatus)}`}>
                          Item Status: {item.itemStatus}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${(item.price || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-bold mt-1 text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Customer, Shipping, Payment */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-900">
              <User className="w-5 h-5 text-gray-500" />
              Customer Details
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Name:</span> {user?.name}</p>
              <p><span className="font-medium text-gray-900">Email:</span> {user?.email}</p>
              <p><span className="font-medium text-gray-900">User ID:</span> <span className="font-mono">{user?._id}</span></p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-900">
              <MapPin className="w-5 h-5 text-gray-500" />
              Shipping Address
            </div>
            <div className="p-4 text-sm text-gray-600">
              {shippingAddress ? (
                <>
                  <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p className="mt-2 text-gray-500">Phone: {shippingAddress.phone}</p>
                </>
              ) : (
                <p className="text-red-500 italic">No shipping address provided</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-900">
              <CreditCard className="w-5 h-5 text-gray-500" />
              Payment Summary
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${(totals?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>${(totals?.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-red-600">${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
