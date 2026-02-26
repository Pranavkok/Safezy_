import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

const SKELETON_COUNT = 12;

const EhsListingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(SKELETON_COUNT)].map((_, index) => (
        <Card key={index} className="group">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2 w-full">
                <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
              </div>
              <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EhsListingSkeleton;
