import React, { useState } from 'react';
import { Input } from '../ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

type PasswordFieldWithLabelPropType = {
  label: string;
  className?: string;
  errorText?: string;
  removeBottomPadding?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const PasswordFieldWithLabel = React.forwardRef<
  HTMLInputElement,
  PasswordFieldWithLabelPropType
>(
  (
    {
      label,
      className,
      required = false,
      errorText,
      removeBottomPadding = false,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev);
    };

    return (
      <div
        className={`space-y-2 ${removeBottomPadding ? '' : 'pb-5'} ${className}`}
      >
        <label className="capitalize" htmlFor={rest.id}>
          {label}
          {required && <span className="ml-[2px] text-red-500">*</span>}
        </label>

        <div className="relative">
          <Input
            id={rest.id}
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            {...rest}
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <EyeIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {errorText && <div className="text-sm text-red-500">{errorText}</div>}
      </div>
    );
  }
);

PasswordFieldWithLabel.displayName = 'PasswordFieldWithLabel';

export default PasswordFieldWithLabel;
