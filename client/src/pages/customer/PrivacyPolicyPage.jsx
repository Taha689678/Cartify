import React from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';

export const PrivacyPolicyPage = () => {
  return (
    <InfoPageLayout title="Privacy Policy" description="Last updated: August 2026. This Privacy Policy describes how Cartify collects, uses, and protects your data.">
      <div className="prose max-w-none text-gray-600 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <p>We may use the information we collect about you to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve our Services.</li>
            <li>Process transactions and send related information, including confirmations and receipts.</li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
            <li>Respond to your comments, questions, and requests, and provide customer service.</li>
            <li>Communicate with you about products, services, offers, promotions, and events.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Sharing of Information</h2>
          <p>We share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf. In a multi-vendor marketplace, necessary fulfillment information (such as your shipping address) is securely shared with the specific Seller fulfilling your order.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Passwords are hashed and payments are processed via secure third-party gateways (Stripe).</p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

