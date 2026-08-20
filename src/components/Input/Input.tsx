import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, errorMessage, id, className, leadingIcon, trailingAction, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const hasAdornment = Boolean(leadingIcon) || Boolean(trailingAction);

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={[
        styles.input,
        leadingIcon && styles.hasLeadingIcon,
        trailingAction && styles.hasTrailingAction,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={Boolean(errorMessage) || undefined}
      aria-describedby={errorId}
      {...rest}
    />
  );

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {hasAdornment ? (
        <div className={styles.control}>
          {leadingIcon && (
            <span className={styles.leadingIcon} aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {inputEl}
          {trailingAction && <span className={styles.trailingAction}>{trailingAction}</span>}
        </div>
      ) : (
        inputEl
      )}
      {errorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
});
