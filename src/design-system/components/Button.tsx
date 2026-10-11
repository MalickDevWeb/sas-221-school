import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all rounded-xl cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-xs gap-2',
      lg: 'px-5 py-2.5 text-sm gap-2.5',
    }[size];

    const variantStyles = {
      primary: 'bg-primary text-text-on-primary shadow-sm shadow-primary/20 hover:opacity-95',
      secondary: 'bg-neutral-100 text-text-body hover:bg-neutral-200',
      outline: 'border border-surface-border bg-white text-text-body hover:bg-neutral-50',
      ghost: 'bg-transparent text-text-body hover:bg-neutral-100',
      danger: 'bg-status-danger text-white shadow-sm hover:opacity-95',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

