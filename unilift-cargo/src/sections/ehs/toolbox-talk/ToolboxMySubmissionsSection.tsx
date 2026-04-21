'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMyToolboxSubmissions } from '@/actions/contractor/toolbox-talk';
import { AppRoutes } from '@/constants/AppRoutes';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, BookOpen, Star, Clock } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import EhsListingSkeleton from '@/skeleton/EhsListingSkeleton';

const formatDuration = (seconds: number | null) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const ToolboxMySubmissionsSection = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['my-toolbox-submissions'],
    queryFn: getMyToolboxSubmissions,
    refetchOnWindowFocus: false
  });

  const submissions = data?.data ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-800">My Toolbox Talk Submissions</h2>
        {!isLoading && (
          <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
            {submissions.length}
          </span>
        )}
      </div>

      {isLoading && <EhsListingSkeleton />}

      {!isLoading && submissions.length === 0 && (
        <EmptyState searchQuery="" contentType="Toolbox Talk Submissions" />
      )}

      {!isLoading && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map(item => {
            const duration = formatDuration(item.duration_seconds);
            return (
              <Card
                key={item.id}
                className="group cursor-pointer border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => router.push(AppRoutes.EHS_TOOLBOX_TALK_REPORT(item.toolbox_talk_id))}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {item.topic_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-4">
                        {item.rating !== null && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{item.rating}/5</span>
                          </div>
                        )}
                        {duration && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{duration}</span>
                          </div>
                        )}
                      </div>
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

export default ToolboxMySubmissionsSection;
