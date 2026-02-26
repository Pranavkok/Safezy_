import React from 'react';

const TermAndConditions = () => {
  return (
    <div className="bg-white">
      <div className="my-10 mx-auto max-w-3xl">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          📄 Terms & Conditions
        </h3>
        <p className="mb-3">
          These Terms & Conditions govern your use of the{' '}
          <span className="font-semibold">Safezy</span> platform, which is owned
          and operated by{' '}
          <span className="font-semibold">
            UNILIFT CARGO SYSTEMS PRIVATE LIMITED
          </span>
          .
        </p>

        <h4 className="font-semibold mt-4 mb-1">🛍️ Order Placement</h4>
        <p className="mb-3">
          By placing an order on{' '}
          <span className="font-semibold">Safezy.in</span>, you agree to provide
          accurate and complete information. All orders are subject to product
          availability and acceptance by Safezy.
        </p>

        <h4 className="font-semibold mt-4 mb-1">🚫 Order Cancellation</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <span className="font-semibold">Before Shipment:</span> Orders may
            be cancelled within 2 hours of placement if not processed or
            dispatched. To cancel, email{' '}
            <a
              href="mailto:support@safezy.in"
              className="text-blue-600 underline"
            >
              support@safezy.in
            </a>{' '}
            /{' '}
            <a
              href="mailto:sales.commercial@uniliftcargo.com"
              className="text-blue-600 underline"
            >
              sales.commercial@uniliftcargo.com
            </a>{' '}
            or call{' '}
            <a href="tel:+918591307077" className="text-blue-600 underline">
              +91 8591307077
            </a>
            .
          </li>
          <li>
            <span className="font-semibold">After Shipment:</span> Orders cannot
            be cancelled once shipped. However, they may be eligible for return
            under certain conditions.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">🔄 Return & Exchange Policy</h4>
        <p className="mb-2">
          Due to the hygiene-sensitive nature of PPE products, returns and
          exchanges are limited.
        </p>

        <p className="font-semibold">Eligible Returns:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Damaged or defective items</li>
          <li>Incorrect product (size, type, or quantity)</li>
          <li>Expired or manufacturing defects</li>
        </ul>

        <p className="font-semibold">To request a return:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            Email{' '}
            <a
              href="mailto:support@safezy.in"
              className="text-blue-600 underline"
            >
              support@safezy.in
            </a>{' '}
            /{' '}
            <a
              href="mailto:sales.commercial@uniliftcargo.com"
              className="text-blue-600 underline"
            >
              sales.commercial@uniliftcargo.com
            </a>
          </li>
          <li>
            Include your Order ID, photos of the product, and reason for return
          </li>
          <li>
            Once approved, we’ll provide a return shipping label. Returns are
            processed within 7–10 business days.
          </li>
        </ul>

        <p className="font-semibold">Non-Returnable Items:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Opened or used products</li>
          <li>Products marked as “Final Sale”</li>
          <li>Products damaged by the user</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">💸 Refund Timeline</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            Prepaid Orders will be refunded to the original payment method.
          </li>
          <li>
            Refunds are processed within 5–7 business days of return approval.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">📦 Return Shipping</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <span className="font-semibold">If Safezy is at fault:</span> Return
            shipping is covered by us.
          </li>
          <li>
            <span className="font-semibold">If initiated by the customer:</span>{' '}
            Return shipping cost is deducted from the refund.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">📞 Contact</h4>
        <p>
          For any issues, reach out via{' '}
          <a
            href="mailto:support@safezy.in"
            className="text-blue-600 underline"
          >
            support@safezy.in
          </a>{' '}
          /{' '}
          <a
            href="mailto:sales.commercial@uniliftcargo.com"
            className="text-blue-600 underline"
          >
            sales.commercial@uniliftcargo.com
          </a>{' '}
          or call{' '}
          <a href="tel:+918591307077" className="text-blue-600 underline">
            +91 8591307077
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TermAndConditions;
