'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Building2 } from 'lucide-react';
import { Worksite } from '@/types/inventory.types';

interface SafetyItemCardProps {
  name: string;
  availability: number;
}

const SafetyItemCard: React.FC<SafetyItemCardProps> = ({
  name,
  availability
}) => {
  const getAvailabilityClass = (): string => {
    if (availability > 10) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div
      className={`hover:shadow-md transition-all duration-300 ${getAvailabilityClass()}  rounded-lg border px-3 py-2 `}
    >
      <div className="flex flex-row items-center justify-between gap-4 ">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-2xl font-bold">{availability}</div>
      </div>
    </div>
  );
};

const ContractorStockAvailability = ({
  stockAvailability
}: {
  stockAvailability: Worksite[];
}) => {
  const [selectedWorksite, setSelectedWorksite] = useState<Worksite | null>(
    null
  );

  const handleWorksiteClick = (worksite: Worksite) => {
    setSelectedWorksite(worksite);
  };

  const handleCloseModal = () => {
    setSelectedWorksite(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="w-8 h-8 text-primary" />
        <h2 className="text-xl font-bold text-primary">
          Worksite & Inventories
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 max-h-[20vh] overflow-y-scroll border p-3 rounded">
        {stockAvailability?.map(worksite => (
          <div
            key={worksite.id}
            className="justify-start border rounded p-2 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary"
            onClick={() => handleWorksiteClick(worksite)}
          >
            {worksite.name}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedWorksite} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <p className="">
                <p className="flex gap-2 items-center">
                  {' '}
                  <Building2 className="w-6 h-6 text-primary" />{' '}
                  {selectedWorksite?.name}
                </p>{' '}
                <p className="font-normal text-sm">
                  {' '}
                  {selectedWorksite?.location as ''}
                </p>
              </p>
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWorksite ? (
              selectedWorksite.safetyItems.length > 0 ? (
                selectedWorksite.safetyItems.map((item, index) => (
                  <SafetyItemCard
                    key={index}
                    name={item.name}
                    availability={item.availability}
                  />
                ))
              ) : (
                <div className="text-gray-500 col-span-full text-center">
                  No equipment available
                </div>
              )
            ) : (
              <div className="text-gray-500 col-span-full text-center">
                No worksite selected
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorStockAvailability;
