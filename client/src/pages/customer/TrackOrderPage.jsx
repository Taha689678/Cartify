import React, { useState } from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { Search, Package, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setStatus('loading');
    
    // Simulate lookup without exposing real user data / building a new backend route
    setTimeout(() => {
      setStatus('error');
    }, 1000);
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
              <span>Public tracking is temporarily unavailable. Please log in to your account to view order details.</span>
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

