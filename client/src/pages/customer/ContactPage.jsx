import React, { useState } from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { Mail, Phone, MapPin, Send, AlertCircle } from 'lucide-react';

export const ContactPage = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, warning

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate network request then show unavailable state (no backend exists)
    setTimeout(() => {
      setStatus('warning');
    }, 1200);
  };

  return (
    <InfoPageLayout 
      title="Contact Us" 
      description="Have a question or need support? Our team is here to help you."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Whether you have a question about your order, want to become a seller, or just want to say hi, we'd love to hear from you.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-gray-500 text-sm mt-1">support@cartify.example.com</p>
                <p className="text-gray-500 text-sm">Response time: 24-48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-gray-500 text-sm mt-1">1-800-CARTIFY</p>
                <p className="text-gray-500 text-sm">Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Office Location</h3>
                <p className="text-gray-500 text-sm mt-1">123 Commerce Avenue</p>
                <p className="text-gray-500 text-sm">Suite 400, Tech District</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="John Doe" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="john@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="How can we help?" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Write your message here..."></textarea>
            </div>

            {status === 'warning' && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm font-medium">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>The message service is currently undergoing maintenance. Please email us directly.</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={status !== 'idle'}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </InfoPageLayout>
  );
};

