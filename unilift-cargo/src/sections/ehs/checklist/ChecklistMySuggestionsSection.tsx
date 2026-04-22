'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { Lightbulb } from 'lucide-react';
import { SuggestionType } from '@/types/index.types';

type Response = {
  success: boolean;
  message: string;
  data?: SuggestionType[];
};

const ChecklistMySuggestionsSection = ({
  initialResponse
}: {
  initialResponse: Response;
}) => {
  const suggestions = initialResponse.data ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Lightbulb className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-800">My Checklist Suggestions</h2>
        <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
          {suggestions.length}
        </span>
      </div>

      {!initialResponse.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {initialResponse.message || 'Failed to load your suggestions.'}
        </div>
      )}

      {initialResponse.success && suggestions.length === 0 && (
        <EmptyState searchQuery="" contentType="Checklist Suggestions" />
      )}

      {initialResponse.success && suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(item => (
            <Card
              key={item.id}
              className="border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.topic_name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Submitted on{' '}
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistMySuggestionsSection;
