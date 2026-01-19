import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(function BrandButton(
  { variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...rest },
  ref
) {
  const classes = [ 'btn', `btn--${variant}`, `btn--${size}`, className ].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  return (
    <button ref={ref} className={classes} disabled={isDisabled} aria-disabled={isDisabled ? 'true' : 'false'} aria-busy={loading ? 'true' : undefined} {...rest}>
      {children}
    </button>
  );
});

export default BrandButton;
