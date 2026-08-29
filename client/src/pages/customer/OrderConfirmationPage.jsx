import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi.js';
import { CheckCircle, Package, Loader2, MapPin } from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrderById(id);
        setOrder(res.data.data.order || res.data.data);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <p className="text-red-500 mb-4">{error || "Order not found"}</p>
          <Link to="/shop" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order placed successfully!</h1>
          <p className="text-gray-500 mb-6">Thank you for your purchase. Your order has been received.</p>
          <div className="bg-gray-50 py-3 px-6 rounded-lg inline-block">
            <span className="text-gray-500 text-sm">Order ID:</span>
            <span className="ml-2 font-mono font-bold text-gray-900">{order._id}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="text-blue-600" />
            Order Details
          </h2>
          
          <div className="space-y-6">
            {/* Items */}
            <div className="space-y-4">
              {order.items?.map((item) => {
                const product = item.product || {};
                const imageSrc = product.images?.[0]?.url || item.image;
                const name = product.name || item.name || 'Unknown Product';
                return (
                  <div key={item._id} className="flex items-center gap-4 py-4 border-b border-gray-50">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {imageSrc ? (
                        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t border-gray-100">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-extrabold text-blue-600">${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Snapshot */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="text-blue-600" />
            Shipping Address
          </h2>
          {order.shippingAddress ? (
            <div className="text-gray-700">
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="mt-1">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(', ')}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-gray-500">{order.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500">No shipping address recorded.</p>
          )}
        </div>

        <div className="text-center">
          <Link to="/shop" className="inline-flex justify-center w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};
