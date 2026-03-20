'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getWorksiteWithAddressOptions,
  WorksiteAddressType
} from '@/actions/contractor/worksite';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddNewWorksiteModal from '@/components/modals/contractor/worksite/AddNewWorksiteModal';

type AddressSelectionPropsType = {
  selectedWorksite: {
    worksite_id: string;
    address_id: string;
    address: WorksiteAddressType;
  };
  setSelectedWorksite: (worksite: {
    worksite_id: string;
    address_id: string;
    address: WorksiteAddressType;
  }) => void;
};

const AddressSelectionSection = ({
  selectedWorksite,
  setSelectedWorksite
}: AddressSelectionPropsType) => {
  const { isPending, data: worksiteOptions = [] } = useQuery({
    queryKey: ['worksiteOptionsWithAddress'],
    queryFn: () => getWorksiteWithAddressOptions(),
    refetchOnWindowFocus: false
  });

  const selectedSite = useMemo(
    () =>
      worksiteOptions.find(
        option => option.value === selectedWorksite.address_id
      ),
    [worksiteOptions, selectedWorksite.address_id]
  );

  const handleSiteChange = (value: string) => {
    const selected = worksiteOptions.find(option => option.value === value);
    if (selected) {
      setSelectedWorksite({
        worksite_id: selected.worksite_id,
        address_id: value,
        address: selected.address
      });
    }
  };

  return (
    <Card className="shadow-lg w-full mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>Select Shipping Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <AddNewWorksiteModal isForCartPage={true} />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="worksite-select"
            className="text-sm text-gray-600 space-y-2"
          >
            <p>
              Location<span className="text-red-500 ml-1">*</span>
            </p>
            <Select
              disabled={isPending}
              onValueChange={handleSiteChange}
              value={selectedWorksite.address_id}
            >
              <SelectTrigger id="worksite-select" className="w-full bg-white">
                <SelectValue placeholder="Select a worksite" />
              </SelectTrigger>
              <SelectContent>
                {isPending && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!isPending && worksiteOptions.length === 0 && (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No worksites found
                  </div>
                )}
                {!isPending &&
                  worksiteOptions.length > 0 &&
                  worksiteOptions.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {selectedSite && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{selectedSite.label}</span>
            </div>
            <p className="text-sm text-gray-600">
              {Object.values(selectedSite.address).filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressSelectionSection;
