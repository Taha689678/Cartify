import React from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';

export const TermsPage = () => {
  return (
    <InfoPageLayout title="Terms of Service" description="Please read these terms carefully before using the Cartify marketplace.">
      <div className="prose max-w-none text-gray-600 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the Cartify platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account. You are responsible for safeguarding the password that you use to access the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Marketplace Platform</h2>
          <p>Cartify acts as a venue to allow users who comply with our policies to offer, sell, and buy certain goods within a fixed-price format. Cartify is not directly involved in the transaction between buyers and sellers. As a result, Cartify exercises no control over the quality, safety, or legality of the items advertised.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Prohibited Activities</h2>
          <p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system, including "robots," "spiders," or "offline readers," to access the Service; (iii) transmitting spam, chain letters, or other unsolicited email; (iv) attempting to interfere with the system integrity or security.</p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

