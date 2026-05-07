/**
 * Input Component — Styled form input
 * 
 * Mendukung label, error message, dan icon prefix.
 * Desain minimalis dengan border subtle.
 */

import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-charcoal-600">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-charcoal-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm
            text-charcoal-700 placeholder-charcoal-300
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-300 focus:ring-red-400'
              : 'border-cream-300 hover:border-cream-400'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
