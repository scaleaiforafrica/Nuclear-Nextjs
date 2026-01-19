import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...rest },
  ref
) {
  const classes = [ 'btn', `btn--${variant}`, `btn--${size}`, className ].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  return (
    <button ref={ref} className={classes} disabled={isDisabled} aria-disabled={isDisabled} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  );
});

export default Button;
