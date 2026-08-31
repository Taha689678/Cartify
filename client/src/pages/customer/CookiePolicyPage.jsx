import React from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';

export const CookiePolicyPage = () => {
  return (
    <InfoPageLayout title="Cookie Policy" description="Learn how and why we use cookies to improve your experience on Cartify.">
      <div className="prose max-w-none text-gray-600 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">What Are Cookies?</h2>
          <p>Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are widely used to make websites work efficiently, as well as to provide information to the owners of the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">How We Use Cookies</h2>
          <p>Cartify strictly uses cookies that are essential for the operation of the platform. We currently use cookies for the following purposes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Authentication:</strong> We use an HTTP-only token cookie to identify you when you visit our website and to help secure your account.</li>
            <li><strong>Preferences:</strong> Saving temporary state preferences (like your shopping cart contents before checkout or UI toggles).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Third-Party Analytics</h2>
          <p>At this time, this demo project does not inject third-party marketing, tracking, or analytics cookies into your browser.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Managing Cookies</h2>
          <p>Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version. Note that blocking all cookies will have a negative impact upon the usability of Cartify, as you will not be able to log in or maintain a shopping session.</p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

