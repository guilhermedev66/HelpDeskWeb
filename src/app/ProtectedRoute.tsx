import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { useAuth } from '../features/auth/useAuth';

export function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite" style={{ padding: 'var(--spacing-xl)' }}>
        Carregando sessão…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" style={{ padding: 'var(--spacing-xl)' }}>
        <p>Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.</p>
        <Button variant="secondary" size="small" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
