'use client';

import { getWorksiteOptions } from '@/actions/contractor/worksite';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import NoWorksiteAdded from './NoWorksiteAdded';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const getWorksiteList = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return await getWorksiteOptions();
};

const WorksiteSelect = ({ dynamicText }: { dynamicText: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentWorksite, setCurrentWorksite] = useState(
    searchParams.get('worksite') ?? ''
  );

  // Use Tanstack Query for data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['worksiteOptions'],
    queryFn: () => getWorksiteList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Set default worksite if not already selected
  useEffect(() => {
    if (data?.length && !currentWorksite) {
      setCurrentWorksite(data[0].value);
      router.replace(`?worksite=${data[0].value}`);
    }
  }, [data]);

  const handleWorksiteChange = (value: string) => {
    if (value !== currentWorksite) {
      setCurrentWorksite(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set('worksite', value);
      router.replace(`?${params.toString()}`);
    }
  };

  // If options are not yet loaded or are fetching, show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center mb-6">
        <div className="animate-pulse w-72 sm:w-96 h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-red-500 text-center">
        Failed to load worksites. Please try again.
      </div>
    );
  }

  if (!data?.length) {
    return <NoWorksiteAdded dynamicText={dynamicText} />;
  }

  return (
    <div className="flex justify-center items-center mb-6">
      <Select
        value={currentWorksite || undefined}
        onValueChange={handleWorksiteChange}
      >
        <SelectTrigger className="w-72 sm:w-96 ring-1 ring-primary">
          <SelectValue placeholder="Select a worksite" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Worksites</SelectLabel>
            {data.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorksiteSelect;
