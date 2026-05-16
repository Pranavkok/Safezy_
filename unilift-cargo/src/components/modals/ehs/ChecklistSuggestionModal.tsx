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
  getChecklistSuggestionsHistory,
  rejectChecklistSuggestion
} from '@/actions/admin/ehs/checklist';
import Spinner from '@/components/loaders/Spinner';
import { Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'pending' | 'history';

const ChecklistSuggestionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const queryClient = useQueryClient();

  const { data: pendingResponse, isFetching: pendingFetching } = useQuery({
    queryKey: ['checklistSuggestion', isOpen],
    queryFn: () => getChecklistSuggestions(),
    enabled: isOpen,
    refetchOnWindowFocus: false
  });

  const { data: historyResponse, isFetching: historyFetching } = useQuery({
    queryKey: ['checklistSuggestionHistory', isOpen],
    queryFn: () => getChecklistSuggestionsHistory(),
    enabled: isOpen && activeTab === 'history',
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

      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: response => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['checklistSuggestion', true] });
      queryClient.invalidateQueries({ queryKey: ['checklistSuggestionHistory', true] });
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to review suggestion.');
    }
  });

  const pendingData = pendingResponse?.success ? pendingResponse.data : [];
  const historyData = historyResponse?.success ? historyResponse.data : [];

  const isFetching = activeTab === 'pending' ? pendingFetching : historyFetching;
  const items = activeTab === 'pending' ? pendingData : historyData;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer" onClick={() => setIsOpen(true)}>
          Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg w-full bg-white"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-bold">Checklist Suggestions</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b mb-3">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
            {(pendingData?.length ?? 0) > 0 && (
              <span className="ml-1.5 bg-orange-100 text-orange-700 text-xs rounded-full px-1.5 py-0.5">
                {pendingData?.length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isFetching && (!items || items.length === 0) && (
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            {activeTab === 'pending' ? 'No pending suggestions' : 'No history found'}
          </div>
        )}

        {!isFetching && items && items.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-3 bg-gray-50 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">
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
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                    {activeTab === 'history' && item.reviewed_at && (
                      <p className="text-xs text-gray-400">
                        Reviewed on{' '}
                        {new Date(item.reviewed_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  {activeTab === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50"
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ suggestionId: item.id, action: 'approve' })}
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
                        onClick={() => reviewMutation.mutate({ suggestionId: item.id, action: 'reject' })}
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
                  ) : (
                    <span
                      className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.review_status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.review_status === 'completed' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
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
