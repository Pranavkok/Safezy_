import React from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

type InputFieldWithLabelPropType = {
  label: string;
  containerClassName?: string;
  labelHelper?: string;
  errorText?: string;
  removeBottomPadding?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputFieldWithLabel = React.forwardRef<
  HTMLInputElement,
  InputFieldWithLabelPropType
>(
  (
    {
      name,
      label,
      type,
      containerClassName,
      labelHelper,
      required = false,
      removeBottomPadding = false,
      errorText,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'space-y-2',
          !removeBottomPadding && 'pb-5',
          containerClassName
        )}
      >
        <label className="capitalize" htmlFor={name}>
          {label}
          <span className="text-gray-400 ml-1 text-sm">
            {labelHelper && labelHelper}
          </span>
          {required && <span className="ml-[2px] text-red-500">*</span>}
        </label>
        <Input type={type} id={name} name={name} ref={ref} {...rest} />
        {errorText && <div className="text-sm text-red-500">{errorText}</div>}
      </div>
    );
  }
);

InputFieldWithLabel.displayName = 'InputFieldWithLabel';

export default InputFieldWithLabel;
