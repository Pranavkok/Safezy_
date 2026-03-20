import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface EllipsisPageButtonProps {
  direction: 'next' | 'previous';
  onNavigate: () => void;
}

const EllipsisPageButton = ({
  direction,
  onNavigate
}: EllipsisPageButtonProps) => {
  const Icon = direction === 'next' ? ChevronsRight : ChevronsLeft;
  const tooltipText =
    direction === 'next' ? 'Next 4 pages' : 'Previous 4 pages';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-white inline-block border border-gray-200 ">
            <button
              type="button"
              onClick={onNavigate}
              className="hidden sm:flex group min-h-[36px] min-w-[36px] justify-center items-center text-gray-400 hover:text-primary p-2 text-sm  disabled:opacity-50 disabled:pointer-events-none "
            >
              <span className="group-hover:hidden text-xs">•••</span>
              <Icon className="group-hover:block hidden shrink-0 size-5" />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function PaginationSection({
  totalPosts,
  postsPerPage,
  currentPage,
  setCurrentPage
}: {
  totalPosts: number;
  postsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const maxPageNum = 5;
  const pageNumLimit = Math.floor(maxPageNum / 2);

  const activePages = pageNumbers.slice(
    Math.max(0, currentPage - 1 - pageNumLimit),
    Math.min(currentPage - 1 + pageNumLimit + 1, pageNumbers.length)
  );

  const handleNextPage = () => {
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPages = () => {
    const renderedPages = activePages.map(page => (
      <button
        key={page}
        type="button"
        className={cn(
          'bg-white min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-200 text-gray-800 hover:text-primary py-2 px-3 text-sm first:rounded-s-lg last:rounded-e-lg focus:outline-none  disabled:opacity-50 disabled:pointer-events-none',
          currentPage === page && 'bg-primary !text-white'
        )}
        onClick={() => setCurrentPage(page)}
        aria-current={currentPage === page ? 'page' : undefined}
      >
        {page}
      </button>
    ));

    if (activePages[0] > 1) {
      renderedPages.unshift(
        <EllipsisPageButton
          direction="previous"
          onNavigate={() => setCurrentPage(activePages[0] - 1)}
        />
      );
    }

    if (activePages[activePages.length - 1] < pageNumbers.length) {
      renderedPages.push(
        <EllipsisPageButton
          direction="next"
          onNavigate={() =>
            setCurrentPage(activePages[activePages.length - 1] + 1)
          }
        />
      );
    }

    return renderedPages;
  };

  return (
    <nav
      className="flex justify-center items-center -space-x-px"
      aria-label="Pagination"
    >
      <button
        type="button"
        className="bg-white group min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 "
        aria-label="Previous"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="shrink-0 size-5 text-gray-500 group-hover:text-primary" />
        <span className="hidden sm:block  group-hover:text-primary">
          Previous
        </span>
      </button>

      {renderPages()}

      <button
        type="button"
        className="bg-white group min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 "
        aria-label="Next"
        onClick={handleNextPage}
        disabled={currentPage === pageNumbers.length}
      >
        <span className="hidden sm:block group-hover:text-primary">Next</span>
        <ChevronRight className="shrink-0 size-5 text-gray-500 group-hover:text-primary" />
      </button>
    </nav>
  );
}
