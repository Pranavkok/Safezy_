'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getToolboxTalkSuggestions } from '@/actions/admin/ehs/toolbox-talk';
import Spinner from '@/components/loaders/Spinner';

const ToolboxTalkSugggestionModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: response,
    error,
    isFetching
  } = useQuery({
    queryKey: ['toolboxSuggestion', isOpen],
    queryFn: () => getToolboxTalkSuggestions(),
    enabled: isOpen,
    refetchOnWindowFocus: false
  });

  const isDataValid = response?.success && response.data;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" onClick={() => setIsOpen(true)}>
          Toolbox Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg w-full bg-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-bold">
            Toolbox Talk Suggestions
          </DialogTitle>
        </DialogHeader>

        {isFetching && (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isFetching &&
          (!isDataValid || error || response.data?.length === 0) && (
            <div className="flex items-center justify-center">
              No suggestions found
            </div>
          )}

        {!isFetching && isDataValid && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {response?.data?.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-2 bg-gray-50 shadow-sm"
              >
                <p className="text-md font-semibold text-gray-600">
                  {item.topic_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ToolboxTalkSugggestionModal;
