import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type ButtonStyle = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'medium' | 'small';

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonStyle;
  size?: ButtonSize;
}

/** Mesma aparência do Button, mas navega (react-router Link) em vez de disparar uma ação. */
export function ButtonLink({ variant = 'primary', size = 'medium', className, ...rest }: ButtonLinkProps) {
  const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
  return <Link className={classNames} {...rest} />;
}
