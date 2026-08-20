import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonStyle = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'medium' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonStyle;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
