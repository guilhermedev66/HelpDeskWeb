import { NavLink } from 'react-router-dom';
import styles from './NavItem.module.css';

interface NavItemProps {
  to: string;
  label: string;
  /** Rail: modo compacto usado no breakpoint de tablet (só o indicador visível). */
  variant?: 'full' | 'rail';
  end?: boolean;
}

export function NavItem({ to, label, variant = 'full', end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [styles.item, variant === 'rail' ? styles.rail : '', isActive ? styles.active : '']
          .filter(Boolean)
          .join(' ')
      }
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </NavLink>
  );
}
