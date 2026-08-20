import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark/BrandMark';
import { NavItem } from '../components/NavItem/NavItem';
import { useAuth } from '../features/auth/useAuth';
import styles from './AuthenticatedLayout.module.css';

function initialsFor(name: string | undefined): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

interface NavLinkConfig {
  to: string;
  label: string;
  end: boolean;
}

// Chamados vale pra todo mundo (User acompanha os próprios, Agent/Admin veem a fila).
// Categorias é exclusivo de Admin — reflete a autorização real da API (ver RequireRole).
function navLinksForRoles(roles: string[] | undefined): NavLinkConfig[] {
  const links: NavLinkConfig[] = [
    { to: '/dashboard', label: 'Dashboard', end: true },
    { to: '/tickets', label: 'Chamados', end: false },
  ];
  if (roles?.includes('Admin')) {
    links.push({ to: '/admin/categories', label: 'Categorias', end: false });
  }
  return links;
}

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navLinks = navLinksForRoles(user?.roles);
  const pageTitle = location.pathname.startsWith('/admin/categories')
    ? 'Categorias'
    : location.pathname.startsWith('/dashboard')
      ? 'Dashboard'
      : 'Chamados';
  const mainRef = useRef<HTMLElement>(null);

  // SPA: trocar de rota não move o foco sozinho (diferente de navegação de página inteira).
  // Sem isso, leitor de tela e teclado ficam "presos" no link que disparou a navegação.
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo principal
      </a>

      <nav className={styles.sidebarFull} aria-label="Navegação principal">
        <span className={styles.brandRow}>
          <BrandMark size={26} />
          <span className={styles.brand}>Help Desk</span>
        </span>
        {navLinks.map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} end={link.end} />
        ))}
      </nav>

      <nav className={styles.sidebarRail} aria-label="Navegação principal">
        <BrandMark size={26} className={styles.railBrandMark} label="Help Desk" />
        {navLinks.map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} end={link.end} variant="rail" />
        ))}
      </nav>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>{pageTitle}</span>
          <div className={styles.userInfo}>
            <span className={styles.avatar} aria-hidden="true">
              {initialsFor(user?.displayName)}
            </span>
            <span className={styles.userText}>
              <span className={styles.userName}>{user?.displayName}</span>
              <span className={styles.userRole}>{user?.roles[0]}</span>
            </span>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <main id="main-content" className={styles.content} tabIndex={-1} ref={mainRef}>
          <Outlet />
        </main>

        <nav className={styles.bottomNav} aria-label="Navegação principal">
          {navLinks.map((link) => (
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
