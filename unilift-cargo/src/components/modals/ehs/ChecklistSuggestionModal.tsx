'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  approveChecklistSuggestion,
  getChecklistSuggestions,
  rejectChecklistSuggestion
} from '@/actions/admin/ehs/checklist';
import Spinner from '@/components/loaders/Spinner';
import { Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ChecklistSuggestionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: response,
    error,
    isFetching
  } = useQuery({
    queryKey: ['checklistSuggestion', isOpen],
    queryFn: () => getChecklistSuggestions(),
    enabled: isOpen,
    refetchOnWindowFocus: false
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      suggestionId,
      action
    }: {
      suggestionId: number;
      action: 'approve' | 'reject';
    }) => {
      const res =
        action === 'approve'
          ? await approveChecklistSuggestion(suggestionId)
          : await rejectChecklistSuggestion(suggestionId);

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    },
    onSuccess: response => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: ['checklistSuggestion', true]
      });
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to review suggestion.'
      );
    }
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
          <DialogTitle className="font-bold">Checklist Suggestions</DialogTitle>
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
            {response?.data?.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-3 bg-gray-50 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-md font-semibold text-gray-700">
                      {item.topic_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted on{' '}
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50"
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({
                          suggestionId: item.id,
                          action: 'approve'
                        })
                      }
                    >
                      {reviewMutation.isPending &&
                      reviewMutation.variables?.suggestionId === item.id &&
                      reviewMutation.variables?.action === 'approve' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Check />
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({
                          suggestionId: item.id,
                          action: 'reject'
                        })
                      }
                    >
                      {reviewMutation.isPending &&
                      reviewMutation.variables?.suggestionId === item.id &&
                      reviewMutation.variables?.action === 'reject' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <X />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistSuggestionModal;
