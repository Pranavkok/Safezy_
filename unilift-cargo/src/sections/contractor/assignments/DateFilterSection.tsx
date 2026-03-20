'use client';

import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, ChangeEvent, FormEvent } from 'react';

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const DateFilterSection = () => {
  const router = useRouter();
  const searchParamsObj = useSearchParams();

  // Extract existing search params
  const worksite = searchParamsObj.get('worksite');
  const fromParam = searchParamsObj.get('from') || '';
  const toParam = searchParamsObj.get('to') || '';

  // State for date inputs
  const [dateRange, setDateRange] = useState({
    from: fromParam || '',
    to: toParam || ''
  });

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date range submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Construct search params
    const params = new URLSearchParams();

    // Add from and to dates if they exist
    if (dateRange.from) {
      params.set('from', new Date(dateRange.from).toISOString());
    } else {
      params.delete('from');
    }

    if (dateRange.to) {
      params.set('to', new Date(dateRange.to).toISOString());
    } else {
      params.delete('to');
    }

    if (worksite) {
      params.set('worksite', worksite);
    }

    // Navigate with new params
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="overflow-x-auto">
      <form
        onSubmit={handleSubmit}
        className="flex justify-end items-center w-max min-w-full px-4 py-2 space-x-2"
      >
        {/* From Date Input */}
        <div className="relative">
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleInputChange}
            className={cn(
              'w-[240px] pl-10 pr-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
              !dateRange.from && 'text-muted-foreground'
            )}
            placeholder="From Date"
          />
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {/* To Date Input */}
        <div className="relative">
          <input
            type="date"
            name="to"
            value={dateRange.to}
            max={getTodayString()}
            onChange={handleInputChange}
            className={cn(
              'w-[240px] pl-10 pr-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
              !dateRange.to && 'text-muted-foreground'
            )}
            placeholder="To Date"
            disabled={!dateRange.from}
          />
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {/* Submit Button */}
        <Button type="submit">Search</Button>
      </form>
    </div>
  );
};

export default DateFilterSection;
