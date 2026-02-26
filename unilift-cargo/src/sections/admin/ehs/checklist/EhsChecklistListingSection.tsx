'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Users, ChevronRight } from 'lucide-react';
import { getAllChecklistTopicWithPerformedCount } from '@/actions/admin/ehs/checklist';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PaginationSection } from '@/components/PaginationSection';
import { AppRoutes } from '@/constants/AppRoutes';
import { Badge } from '@/components/ui/badge';
import ConfirmDeleteEhsChecklist from './ConfirmDeleteEhsChecklist';
import ChecklistSuggestionModal from '@/components/modals/ehs/ChecklistSuggestionModal';

const ITEM_PER_PAGE = 12;

const EhsChecklistListingSection = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: checklistData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['allChecklistTopics', currentPage],
    queryFn: async () =>
      await getAllChecklistTopicWithPerformedCount(currentPage, ITEM_PER_PAGE),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg text-gray-600">Loading Checklist Topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold">Error Loading Topics</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const paginatedTopics = checklistData?.data || [];

  if (!paginatedTopics.length) {
    return (
      <>
        <div className="flex flex-col md:flex-row gap-2 justify-between my-5">
          <ChecklistSuggestionModal />
          <Button
            onClick={() => router.push(AppRoutes.ADMIN_EHS_CHECKLIST_ADD)}
          >
            <Plus className="w-5 h-5" />
            Add New Checklist Topic
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Topics Available</h3>
            <p className="text-gray-600 mt-2">
              There are currently no checklist topics to display.
            </p>
          </div>
          <Button
            onClick={() => router.push(AppRoutes.ADMIN_EHS_CHECKLIST_ADD)}
            variant="outline"
          >
            Create First Topic
          </Button>
        </div>
      </>
    );
  }
  return (
    <div className="w-full px-4 sm:px-6">
      <div className="flex flex-col md:flex-row  gap-2 justify-between my-5">
        <ChecklistSuggestionModal />
        <Button onClick={() => router.push(AppRoutes.ADMIN_EHS_CHECKLIST_ADD)}>
          <Plus className="w-5 h-5" />
          Add New Checklist Topic
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {paginatedTopics.map(topic => (
          <div
            key={topic.id}
            className="group relative bg-white rounded-xl border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            role="article"
          >
            <div className="absolute top-4 right-4 ">
              <div className="flex items-center gap-2">
                <ConfirmDeleteEhsChecklist id={topic.id} />
              </div>
            </div>

            <div
              className="p-4 sm:p-6 cursor-pointer"
              onClick={() =>
                router.push(AppRoutes.ADMIN_EHS_CHECKLIST_UPDATE(topic.id))
              }
            >
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 mb-2 pr-12 sm:pr-16">
                    {topic.topic_name}
                  </h3>
                  {topic.performed && (
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs sm:text-sm"
                      >
                        <Users className="w-3 h-3" />
                        <span>{topic.performed[0].count} Performed</span>
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>Click to view or edit details</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 sm:pt-10 pb-2">
        <PaginationSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          postsPerPage={ITEM_PER_PAGE}
          totalPosts={checklistData?.count || 0}
        />
      </div>
    </div>
  );
};

export default EhsChecklistListingSection;
