'use client';

import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

type ChecklistSubmission = {
  id: number;
  topic_id: number;
  topic_name: string;
  date: string;
  site_name: string;
  inspected_by: string;
  progress: { date: string; progress: number }[];
};

type ChecklistSubmissionsResponse = {
  success: boolean;
  message: string;
  data?: ChecklistSubmission[];
};

const ChecklistMySubmissionsSection = ({
  initialResponse
}: {
  initialResponse: ChecklistSubmissionsResponse;
}) => {
  const router = useRouter();

  const hasFetchError = !initialResponse.success;
  const submissions = initialResponse.data ?? [];

  const latestProgress = (progress: { date: string; progress: number }[]) => {
    if (!progress?.length) return null;
    return progress[progress.length - 1].progress;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-800">My Checklist Submissions</h2>
        <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
          {submissions.length}
        </span>
      </div>

      {hasFetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {initialResponse.message || 'Failed to load your checklist submissions.'}
        </div>
      )}

      {!hasFetchError && submissions.length === 0 && (
        <EmptyState searchQuery="" contentType="Checklist Submissions" />
      )}

      {!hasFetchError && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map(item => {
            const score = latestProgress(item.progress);
            return (
              <Card
                key={item.id}
                className="group cursor-pointer border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => router.push(AppRoutes.EHS_CHECKLIST_SUBMISSION_VIEW(item.id))}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {item.topic_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                      {item.site_name && (
                        <p className="text-sm text-gray-600">Site: {item.site_name}</p>
                      )}
                      {item.inspected_by && (
                        <p className="text-sm text-gray-600">Inspected by: {item.inspected_by}</p>
                      )}
                      {score !== null && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-primary whitespace-nowrap">
                            {score}%
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300 ml-3 mt-1 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChecklistMySubmissionsSection;
