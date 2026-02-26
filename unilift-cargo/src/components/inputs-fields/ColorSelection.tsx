import { cn } from '@/lib/utils';
import React from 'react';

type ColorSelectionPropsType = {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
};

const ColorSelection = ({
  color,
  isSelected,
  onClick,
  className
}: ColorSelectionPropsType) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full transition-all',
        isSelected
          ? 'ring-2 ring-offset-2 ring-primary'
          : 'ring-1 ring-gray-200 hover:scale-105',
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={`Select color ${color}`}
    />
  );
};

export default ColorSelection;
