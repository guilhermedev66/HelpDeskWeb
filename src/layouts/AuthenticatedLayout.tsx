import { NavLink, Outlet } from 'react-router-dom';
import { NavItem } from '../components/NavItem/NavItem';
import { useAuth } from '../features/auth/useAuth';
import styles from './AuthenticatedLayout.module.css';

const NAV_LINKS = [{ to: '/', label: 'Chamados', end: true }];

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebarFull} aria-label="Navegação principal">
        <span className={styles.brand}>Help Desk</span>
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} end={link.end} />
        ))}
      </nav>

      <nav className={styles.sidebarRail} aria-label="Navegação principal">
        <span className={styles.railBrandDot} aria-hidden="true" />
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} end={link.end} variant="rail" />
        ))}
      </nav>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>Chamados</span>
          <div className={styles.userInfo}>
            <span className={styles.avatar} aria-hidden="true" />
            <span className={styles.userText}>
              <span className={styles.userName}>{user?.displayName}</span>
              <span className={styles.userRole}>{user?.roles[0]}</span>
            </span>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>

        <nav className={styles.bottomNav} aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <BottomNavLink key={link.to} to={link.to} label={link.label} end={link.end} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function BottomNavLink({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={styles.bottomNavItem}>
      <span className={styles.bottomNavDot} aria-hidden="true" />
      {label}
    </NavLink>
  );
}
