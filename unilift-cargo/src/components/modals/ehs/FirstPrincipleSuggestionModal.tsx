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
import { getFirstPrincipleSuggestions } from '@/actions/admin/ehs/first-principles';
import Spinner from '@/components/loaders/Spinner';

const FirstPrincipleSugggestionModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: response,
    error,
    isFetching
  } = useQuery({
    queryKey: ['principleSuggestion', isOpen],
    queryFn: () => getFirstPrincipleSuggestions(),
    enabled: isOpen
  });

  const isDataValid = response?.success && response.data;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer" onClick={() => setIsOpen(true)}>
          Suggestions
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
            First Principle Suggestions
          </DialogTitle>
        </DialogHeader>

        {isFetching && (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isFetching && (!isDataValid || error) && (
          <div className="flex items-center justify-center">
            No suggestions found
          </div>
        )}

        {!isFetching && isDataValid && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {response?.data?.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-gray-50 shadow-sm"
              >
                <p className="text-md font-semibold text-gray-700">
                  {item.topic_name}
                </p>
                {item.user && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.user.first_name} {item.user.last_name}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Submitted on{' '}
                  {new Date(item.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FirstPrincipleSugggestionModal;
