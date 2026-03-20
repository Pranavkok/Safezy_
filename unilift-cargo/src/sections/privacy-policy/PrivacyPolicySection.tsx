import React from 'react';

const PrivacyPolicySection = () => {
  return (
    <div className="bg-white ">
      <div className=" mx-auto max-w-3xl my-10">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          🔐 Privacy Policy
        </h3>
        <p className="mb-3">
          At <span className="font-semibold">Safezy</span>, a platform owned and
          operated by{' '}
          <span className="font-semibold">
            UNILIFT CARGO SYSTEMS PRIVATE LIMITED
          </span>
          , your privacy is our top priority. This policy explains how we
          collect, use, and protect your personal data when you use our
          services.
        </p>

        <h4 className="font-semibold mt-4 mb-1">
          🧾 What Information We Collect:
        </h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Name, email, phone number, and shipping/billing address</li>
          <li>Order history and communication records</li>
          <li>Device and browsing information (for performance & analytics)</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">
          🔒 How We Protect Your Data:
        </h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            We implement encryption and advanced security measures to safeguard
            your data.
          </li>
          <li>Access is strictly limited to authorized personnel.</li>
          <li>
            Our systems are regularly updated and monitored to prevent data
            breaches.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">🤝 Sharing of Information:</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            We do not sell, trade, or rent your personal information to third
            parties.
          </li>
          <li>
            We may share data only with trusted service providers (e.g.,
            logistics, payment gateways) who assist us in serving you — under
            confidentiality agreements.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">⚙️ Data Usage:</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>To process orders and provide services</li>
          <li>To improve user experience and site functionality</li>
          <li>
            To send updates, order confirmations, and promotional communication
            (opt-in only)
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">🧾 Your Rights:</h4>
        <p className="mb-3">
          You may request access, correction, or deletion of your personal data
          at any time by contacting{' '}
          <a
            href="mailto:support@safezy.in"
            className="text-blue-600 underline"
          >
            support@safezy.in
          </a>{' '}
          or{' '}
          <a
            href="mailto:sales.commercial@uniliftcargo.com"
            className="text-blue-600 underline"
          >
            sales.commercial@uniliftcargo.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicySection;
