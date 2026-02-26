'use client';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const WarehouseOperatorDashboardSection = () => {
  // State to store the orderId input
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  // Function to handle form submission and redirect
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim() === '') return; // Prevent redirection for empty input

    // Redirect to the desired URL
    router.push(
      `/warehouse-operator/manage-order/${orderId}?page=1&per_page=10`
    );
  };

  return (
    <div className="flex justify-center">
      <form
        className="border-primary border p-5 rounded w-[520px] mt-56"
        onSubmit={handleSubmit}
      >
        {/* Input for Order Id */}
        <InputFieldWithLabel
          label="Order Id"
          value={orderId}
          onChange={e => setOrderId(e.target.value)} // Update the state
          required
        />

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit">Enter</Button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseOperatorDashboardSection;
