import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, AlertCircle, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import { orderApi } from '../../api/orderApi.js';
import { paymentApi } from '../../api/paymentApi.js';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrderById(id);
      setOrder(res.data.data.order || res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await orderApi.cancelOrder(id);
      await fetchOrder(); // Refetch to get updated status
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const [retryingPayment, setRetryingPayment] = useState(false);

  const handleRetryPayment = async () => {
    try {
      setRetryingPayment(true);
      const paymentRes = await paymentApi.initiatePayFastPayment({ orderId: id });
      const checkoutUrl = paymentRes.data.data.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("Failed to initiate payment. Please try again.");
        setRetryingPayment(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment.');
      setRetryingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
          <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center h-64">
        <AlertCircle size={40} className="mb-4 text-red-400" />
        <h3 className="text-lg font-bold mb-2">Error Loading Order</h3>
        <p className="mb-6 text-sm">{error || 'Order not found'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Back to Orders
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

  const isCancelable = order.orderStatus?.toLowerCase() === 'pending';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
      >
        <ChevronLeft size={16} />
        Back to My Orders
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order #{order._id.substring(0, 8)}</h1>
            <p className="text-gray-500 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus?.toUpperCase() || 'UNKNOWN'}
              </span>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                PAYMENT: {order.paymentStatus?.toUpperCase() || 'UNPAID'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {order.paymentStatus === 'pending' && order.paymentMethod === 'online' && (
              <button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 w-full md:w-auto"
              >
                {retryingPayment ? 'Redirecting...' : 'Retry Payment'}
              </button>
            )}

            {isCancelable && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50 w-full md:w-auto"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} className="text-blue-500" />
              Items in your order
            </h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={item._id || index} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product?.slug || item.product}`} className="font-bold text-gray-900 hover:text-blue-600 truncate block">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Rs {item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Shipping Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address provided.</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-gray-400" />
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs {((order.totalAmount || 0) - (order.shippingFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? 'Free' : `Rs ${(order.shippingFee || 0).toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span>Rs {(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
