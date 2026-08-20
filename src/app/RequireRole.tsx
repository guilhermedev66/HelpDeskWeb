import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

/**
 * Gate de UI (esconde a tela pra quem não tem o papel). Não substitui a autorização
 * real: os endpoints de categoria exigem Admin no back-end e retornam 403 de qualquer forma.
 */
export function RequireRole({ role }: { role: string }) {
  const { user } = useAuth();

  if (!user?.roles.includes(role)) {
    return (
      <div role="alert" style={{ padding: 'var(--spacing-xl)' }}>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return <Outlet />;
}
