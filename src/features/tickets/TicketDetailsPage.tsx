import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { ApiError } from '../../lib/httpClient';
import { useAuth } from '../auth/useAuth';
import { CommentForm } from './components/CommentForm';
import { CommentList } from './components/CommentList';
import { HistoryTimeline } from './components/HistoryTimeline';
import { PriorityBadge } from './components/PriorityBadge';
import { StatusBadge } from './components/StatusBadge';
import { WorkflowActions } from './components/WorkflowActions';
import { formatDateTime } from './dates';
import { getAgentLabel, getRequesterLabel, resolveCategoryName, shortId } from './presentation';
import { getFirstResponseSlaVisual, getResolutionSlaVisual } from './sla';
import { useCategoriesQuery } from './useCategoriesQuery';
import {
  useTicketCommentsQuery,
  useTicketDetailsQuery,
  useTicketHistoryQuery,
} from './useTicketDetailsQuery';
import styles from './TicketDetailsPage.module.css';

export function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const ticketQuery = useTicketDetailsQuery(ticketId!);
  const commentsQuery = useTicketCommentsQuery(ticketId!);
  const historyQuery = useTicketHistoryQuery(ticketId!);
  const categoriesQuery = useCategoriesQuery();

  if (ticketQuery.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <Skeleton width="40%" height={24} />
          <div className={styles.spacedTop}>
            <Skeleton height={16} />
          </div>
        </div>
      </div>
    );
  }

  if (ticketQuery.isError) {
    const isNotFound = ticketQuery.error instanceof ApiError && ticketQuery.error.status === 404;
    return (
      <div className={styles.errorBox} role="alert">
        <p>
          {isNotFound ? 'Chamado não encontrado.' : 'Não foi possível carregar o chamado. Tente novamente.'}
        </p>
        {isNotFound ? (
          <Link to="/tickets">Voltar para chamados</Link>
        ) : (
          <Button variant="secondary" size="small" onClick={() => ticketQuery.refetch()}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  const ticket = ticketQuery.data;
  if (!ticket) return null;
  const categories = categoriesQuery.data ?? [];

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isAgent = user?.roles.includes('Agent') ?? false;
  const isAgentOrAdmin = isAdmin || isAgent;
  const canComment =
    ticket.status !== 'Closed' &&
    (isAdmin ||
      (isAgent && ticket.assignedAgentId === user?.id) ||
      (!isAgentOrAdmin && ticket.createdByUserId === user?.id));

  const resolutionSla = getResolutionSlaVisual(ticket.status, ticket.resolutionDueAt);
  const firstResponseSla = getFirstResponseSlaVisual(ticket.firstResponseDueAt, ticket.firstRespondedAt);

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link to="/tickets">Chamados</Link> / {shortId(ticket.id)}
      </p>

      <div className={styles.layout}>
        <div className={styles.left}>
          <section className={styles.card}>
            <div className={styles.headerTop}>
              <span className={styles.headerId}>{shortId(ticket.id)}</span>
              <h1 className={styles.title}>{ticket.title}</h1>
            </div>
            <div className={styles.badgeRow}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span>v{ticket.version}</span>
              <span>·</span>
              <span>Categoria: {resolveCategoryName(categories, ticket.categoryId)}</span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Solicitante</span>
                <span className={styles.metaValue}>
                  {getRequesterLabel(ticket.createdByUserId, user?.id)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Agente responsável</span>
                <span className={styles.metaValue}>{getAgentLabel(ticket.assignedAgentId, user?.id)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Criado em</span>
                <span className={styles.metaValue}>{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Primeira resposta</span>
                <span className={styles.metaValue}>
                  {ticket.firstRespondedAt ? formatDateTime(ticket.firstRespondedAt) : '—'}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Descrição</h2>
            <p className={styles.description}>{ticket.description}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Comentários</h2>
            {commentsQuery.isLoading && <Skeleton height={16} />}
            {commentsQuery.isError && (
              <p className={styles.notice}>Não foi possível carregar os comentários.</p>
            )}
            {commentsQuery.data && <CommentList comments={commentsQuery.data} />}

            <div className={styles.spacedTop}>
              {canComment ? (
                <CommentForm ticketId={ticket.id} />
              ) : (
                <p className={styles.notice}>
                  {ticket.status === 'Closed'
                    ? 'Chamados fechados não recebem novos comentários.'
                    : 'Você não tem permissão para comentar neste chamado.'}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={styles.right}>
          {isAgentOrAdmin && (
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Ações do agente</h2>
              <WorkflowActions ticket={ticket} currentUserId={user?.id} isAdmin={isAdmin} />
            </section>
          )}

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>SLA</h2>
            <div className={styles.slaRow}>
              <span className={styles.slaLabel}>Primeira resposta</span>
              <span>{firstResponseSla.label}</span>
            </div>
            <div className={styles.slaRow}>
              <span className={styles.slaLabel}>Prazo de resolução</span>
              <span>{resolutionSla.label}</span>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Histórico</h2>
            {historyQuery.isLoading && <Skeleton height={16} />}
            {historyQuery.isError && <p className={styles.notice}>Não foi possível carregar o histórico.</p>}
            {historyQuery.data && <HistoryTimeline entries={historyQuery.data} currentUserId={user?.id} />}
          </section>
        </div>
      </div>
    </div>
  );
}
