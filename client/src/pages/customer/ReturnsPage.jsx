import React from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { RefreshCcw, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

export const ReturnsPage = () => {
  return (
    <InfoPageLayout 
      title="Returns & Refunds" 
      description="We want you to be completely satisfied with your purchase. Here is how our return process works."
    >
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <Clock className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">30-Day Window</h3>
            <p className="text-sm">You have 30 days from the date of delivery to initiate a return for most items.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <RefreshCcw className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Process</h3>
            <p className="text-sm">Initiate returns directly from your Orders dashboard with just a few clicks.</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Return Eligibility</h2>
          <p>To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original packaging. Some product categories are exempt from being returned (see below).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Non-returnable Items</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Perishable goods (e.g., food, flowers)</li>
            <li>Personal care items and intimates</li>
            <li>Downloadable software products</li>
            <li>Gift cards</li>
            <li>Customized or personalized items</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Refund Process</h2>
          <p>Once your return is received and inspected by the seller, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days.</p>
        </section>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl flex items-start gap-4 border border-gray-200">
          <AlertCircle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900">Received a damaged item?</h3>
            <p className="text-sm mt-1">If your item arrived damaged or defective, please contact our support team within 48 hours of delivery with photos of the damage for an immediate replacement or full refund.</p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

