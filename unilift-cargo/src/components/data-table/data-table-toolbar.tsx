'use client';

import type { Table } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import SearchIcon from '@/components/svgs/SearchIcon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTableFilterField } from '@/types/data-table.types';
import { HTMLAttributes, ReactNode, useMemo, useState } from 'react';

interface DataTableToolbarProps<TData> extends HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
  customComponent?: ReactNode;
  onFilterChange?: (filters: {
    column: string | undefined;
    value: string | undefined;
  }) => void;
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  customComponent,
  children,
  className,
  onFilterChange,
  ...props
}: DataTableToolbarProps<TData>) {
  const { searchableColumns, filterableColumns } = useMemo(() => {
    return {
      searchableColumns: filterFields.filter(field => !field.options),
      filterableColumns: filterFields.filter(field => field.options)
    };
  }, [filterFields]);

  const isFiltered = table
    .getState()
    .columnFilters.find(data =>
      filterFields.filter(field => field.value === data.id)
    );

  const [selectedFilter, setSelectedFilter] = useState<
    { column: string; value: string } | undefined
  >(
    isFiltered
      ? { value: isFiltered.value as string, column: isFiltered.id }
      : undefined
  );

  const handleSelectChange = (value: string) => {
    const [columnKey, columnValue] = value.split('|');
    setSelectedFilter({ column: columnKey, value: columnValue });

    // Clear any existing filters on all filterable columns
    filterableColumns.forEach(column => {
      table.getColumn(String(column.value))?.setFilterValue(undefined);
    });

    // Apply the new filter based on the selected column and value
    if (columnValue) {
      table.getColumn(columnKey)?.setFilterValue([columnValue]);
    } else {
      // If no value is selected, remove the filter for the column
      table.getColumn(columnKey)?.setFilterValue(undefined);
    }

    // Call onFilterChange to reflect the changes in the parent component or query params
    onFilterChange?.({ column: columnKey, value: columnValue });
  };

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between space-x-2 overflow-auto p-1',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map((column, index) => (
            <div
              key={index}
              className="relative flex items-center border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-primary"
            >
              {/* Search Icon */}
              <SearchIcon className="absolute left-3 w-5 h-5 text-gray-500" />

              {/* Input Field */}
              <Input
                key={String(column.value)}
                placeholder={'Search Records'}
                value={
                  (table
                    .getColumn(String(column.value))
                    ?.getFilterValue() as string) ?? ''
                }
                onChange={event => {
                  table
                    .getColumn(String(column.value))
                    ?.setFilterValue(event.target.value);
                  // Update filters in the parent component or query params
                  onFilterChange?.({
                    column: String(column.value),
                    value: event.target.value
                  });
                }}
                className="w-40 lg:w-72 pl-10 bg-transparent"
              />
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2">{children}</div>

      {/* Single Select for Filtering Options */}
      {filterableColumns.length > 0 && (
        <Select
          onValueChange={handleSelectChange}
          value={
            selectedFilter
              ? `${selectedFilter.column}|${selectedFilter.value}`
              : undefined
          }
        >
          <SelectTrigger className="w-40 lg:w-72">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {filterableColumns.map(column =>
              column.options?.map(option => (
                <SelectItem
                  key={`${String(column.value)}|${option.value}`}
                  value={`${String(column.value)}|${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {customComponent && <div>{customComponent}</div>}
    </div>
  );
}
