import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-text-body">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white text-text-body transition-all outline-none ${
            error
              ? 'border-status-danger focus:ring-2 focus:ring-status-danger/20'
              : 'border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] font-semibold text-status-danger">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

