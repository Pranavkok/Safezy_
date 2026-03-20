'use client';

import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setUniqueCookie } from '@/actions/principal-employer/cookie';

const PrincipalEmployerDashboardSection = ({
  cookieUniqueCode
}: {
  cookieUniqueCode: string;
}) => {
  const [uniqueCode, setUniqueCode] = useState(cookieUniqueCode);
  const router = useRouter();

  useEffect(() => {
    setUniqueCode(cookieUniqueCode);
  }, [setUniqueCode, cookieUniqueCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueCode.trim() === '') return;

    await setUniqueCookie(uniqueCode);

    router.push(`/principal-employer/orders/?uniqueCode=${uniqueCode}`);
  };

  return (
    <div className="flex justify-center">
      <form
        className="border-primary border p-5 rounded w-[520px] mt-56"
        onSubmit={handleSubmit}
      >
        <InputFieldWithLabel
          label="Unique Code"
          value={uniqueCode}
          onChange={e => setUniqueCode(e.target.value)}
          required
        />

        <div className="flex justify-center">
          <Button type="submit">Enter</Button>
        </div>
      </form>
    </div>
  );
};

export default PrincipalEmployerDashboardSection;
