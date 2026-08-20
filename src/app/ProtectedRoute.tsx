import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { useAuth } from '../features/auth/useAuth';
import { useSlowRequestNotice } from '../lib/useSlowRequestNotice';
import styles from './ProtectedRoute.module.css';

export function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();
  const isSlow = useSlowRequestNotice(status === 'loading', 4000);

  if (status === 'loading') {
    return (
      <div className={styles.wrap} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Carregando sessão…</p>
        {isSlow && (
          <p className={styles.coldStart}>
            Estamos iniciando o servidor de demonstração… a primeira conexão pode levar alguns segundos porque
            a hospedagem gratuita "dorme" o back-end quando ele fica sem uso.
          </p>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.errorWrap} role="alert">
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
