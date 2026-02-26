'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export type SelectOptionsType = {
  value: string;
  label: string;
}[];

type SelectWithLabelProps = {
  label: string;
  required?: boolean;
  options: SelectOptionsType;
  errorText?: string;
  onChange: (value: string) => void;
  value: string | undefined;
  name?: string;
  loading?: boolean; // Added loading prop
  disabled?: boolean;
};

const SelectWithLabel: React.FC<SelectWithLabelProps> = ({
  name,
  label,
  required = false,
  options,
  errorText,
  onChange,
  value,
  loading = false,
  disabled = false
}) => {
  return (
    <div className={cn('space-y-2', 'pb-5')}>
      <label className="capitalize" htmlFor={name}>
        {label}
        {required && <span className="ml-[2px] text-red-500">*</span>}
      </label>
      <Select
        name={name}
        value={value}
        onValueChange={onChange}
        disabled={disabled || loading}
      >
        <SelectTrigger
          id={name}
          className="placeholder:!text-gray-400 placeholder:!font-medium"
        >
          <SelectValue
            className="capitalize"
            placeholder={loading ? 'Loading...' : 'Select Option'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {loading ? (
              <SelectItem disabled value="loading">
                Loading options...
              </SelectItem>
            ) : (
              options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {errorText && <div className="text-sm text-red-500">{errorText}</div>}
    </div>
  );
};

export default SelectWithLabel;
