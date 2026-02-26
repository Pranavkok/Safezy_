import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

interface BadgeListPropsType {
  title: string;
  items: (string | null)[];
  maxVisibleBadges?: number; // Optional prop for maximum visible badges
}

const BadgeList = ({
  title,
  items,
  maxVisibleBadges = 3
}: BadgeListPropsType) => {
  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <h3 className="font-semibold whitespace-nowrap text-sm lg:text-base">
        {title}:
      </h3>
      <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
        {/* Show all badges, but limit the display of badges on larger screens */}
        {items?.slice(0, maxVisibleBadges).map((item, index) => (
          <Badge
            key={index} // Unique key for each badge
            className="px-3 h-7 rounded-3xl text-xs lg:text-sm font-medium shadow whitespace-nowrap"
          >
            {item} {/* Display badge text */}
          </Badge>
        ))}

        {/* Show the 'X+' badge if there are more items and content is overflowing */}
        {items?.length > maxVisibleBadges && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className="px-3 h-7 rounded-3xl text-xs lg:text-sm font-medium shadow whitespace-nowrap">
                  {/* Display the count of additional items */}
                  {`${items.length - maxVisibleBadges}+`}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="w-[500px] px-5 py-4 bg-white border shadow  text-black  ">
                {/* Show hidden items in tooltip */}
                <p className="text-sm">
                  {items.slice(maxVisibleBadges).join(', ')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default BadgeList; // Export the BadgeList component for use in other parts of the application
