import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon
} from '@radix-ui/react-icons';
import { type Column } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        aria-label={
          column.getIsSorted() === 'desc'
            ? 'Sorted descending. Click to sort ascending.'
            : column.getIsSorted() === 'asc'
              ? 'Sorted ascending. Click to sort descending.'
              : 'Not sorted. Click to sort ascending.'
        }
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 hover:bg-background"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span className="font-bold text-sm">{title}</span>
        {column.getCanSort() && column.getIsSorted() === 'desc' ? (
          <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
        ) : (
          <CaretSortIcon className="ml-2 size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
