import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required = false,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={`block w-full rounded-xl border transition-all duration-150 sm:text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 bg-red-50/30'
              : 'border-slate-300 text-slate-900 placeholder-slate-400 bg-white hover:border-slate-400 focus:bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
