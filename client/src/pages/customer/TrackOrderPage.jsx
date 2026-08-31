import React, { useState } from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { Search, Package, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi.js';

export const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error

  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setStatus('loading');
    setTrackingData(null);
    try {
      const res = await orderApi.trackOrder(orderId);
      setTrackingData(res.data.data.order);
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <InfoPageLayout 
      title="Track Your Order" 
      description="Enter your order details below to check the current status of your shipment."
    >
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <Package className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900">Guest Order Tracking</h3>
              <p className="text-blue-700 text-sm mt-1">
                If you have an account, you can also view all your order statuses directly in your <Link to="/orders" className="underline font-bold hover:text-blue-800">Orders Dashboard</Link>.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <input 
              type="text" 
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="e.g. 64b8f... (from your confirmation email)" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="Email used for the order" 
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>We couldn't find an order with that ID. Please check and try again.</span>
            </div>
          )}

          {status === 'success' && trackingData && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <h3 className="font-bold text-gray-900">Order Status</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-sm rounded-full capitalize">
                  {trackingData.orderStatus}
                </span>
              </div>
              <div className="space-y-3">
                {trackingData.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
          >
            {status === 'loading' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Track Package
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </InfoPageLayout>
  );
};

