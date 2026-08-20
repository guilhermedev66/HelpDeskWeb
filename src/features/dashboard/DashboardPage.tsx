import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { ButtonLink } from '../../components/Button/ButtonLink';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useAuth } from '../auth/useAuth';
import { formatDateTime } from '../tickets/dates';
import { PriorityBadge } from '../tickets/components/PriorityBadge';
import { StatusBadge } from '../tickets/components/StatusBadge';
import { useDashboardStatsQuery } from './useDashboardStatsQuery';
import styles from './DashboardPage.module.css';

function firstName(displayName: string | undefined): string {
  return displayName?.trim().split(/\s+/)[0] ?? '';
}

export function DashboardPage() {
  const { user } = useAuth();
  const statsQuery = useDashboardStatsQuery();
  const isAgentOrAdmin = Boolean(user?.roles.some((role) => role === 'Agent' || role === 'Admin'));

  const cards = statsQuery.data
    ? [
        { label: 'Total de chamados', value: statsQuery.data.total, tone: 'accent' as const },
        { label: 'Abertos', value: statsQuery.data.open, tone: 'open' as const },
        { label: 'Em andamento', value: statsQuery.data.inProgress, tone: 'in-progress' as const },
        { label: 'Resolvidos', value: statsQuery.data.resolved, tone: 'resolved' as const },
        { label: 'Prioridade alta', value: statsQuery.data.highPriority, tone: 'high' as const },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1>Olá, {firstName(user?.displayName)} 👋</h1>
        <p>
          {isAgentOrAdmin
            ? 'Aqui está um resumo dos chamados da fila.'
            : 'Aqui está um resumo dos seus chamados.'}
        </p>
      </div>

      {statsQuery.isLoading && (
        <div className={styles.statsRow}>
          {Array.from({ length: 5 }, (_, index) => (
            <div className={styles.statCard} key={index}>
              <Skeleton width={36} height={36} />
              <Skeleton width="60%" height={26} />
              <Skeleton width="80%" />
            </div>
          ))}
        </div>
      )}

      {statsQuery.isError && (
        <div className={styles.errorBox} role="alert">
          <p>Não foi possível carregar o resumo. Tente novamente.</p>
          <Button variant="secondary" size="small" onClick={() => statsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {statsQuery.data && (
        <>
          <div className={styles.statsRow}>
            {cards.map((card) => (
              <div className={styles.statCard} key={card.label}>
                <span className={`${styles.statIcon} ${styles[`tone-${card.tone}`]}`} aria-hidden="true" />
                <span className={styles.statValue}>{card.value}</span>
                <span className={styles.statLabel}>{card.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <h2>Chamados recentes</h2>
              <Link to="/tickets" className={styles.viewAll}>
                Ver todos
              </Link>
            </div>

            {statsQuery.data.recent.length === 0 ? (
              <EmptyState
                title="Nenhum chamado ainda"
                description={
                  isAgentOrAdmin
                    ? 'Quando novos chamados forem abertos, eles aparecem aqui.'
                    : 'Abra seu primeiro chamado para começar a acompanhar o atendimento.'
                }
                action={<ButtonLink to="/tickets/new">Novo chamado</ButtonLink>}
              />
            ) : (
              <div className={styles.recentCard}>
                {statsQuery.data.recent.map((ticket) => (
                  <Link to={`/tickets/${ticket.id}`} className={styles.recentRow} key={ticket.id}>
                    <span className={styles.recentTitle}>{ticket.title}</span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className={styles.recentDate}>{formatDateTime(ticket.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
