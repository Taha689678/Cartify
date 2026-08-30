import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi.js';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setError('No order ID provided.');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await orderApi.getOrderById(orderId);
        const order = res.data.data.order || res.data.data;
        if (order.paymentStatus === 'paid') {
          setStatus('success');
        } else {
          // Poll again after 2 seconds if still pending
          setTimeout(checkStatus, 2000);
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to fetch order status.');
      }
    };

    checkStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been paid successfully.</p>
            <Link to={`/orders/${orderId}`} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block w-full">
              View Order
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block w-full">
              Go to Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
