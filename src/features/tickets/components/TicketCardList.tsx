import { Link } from 'react-router-dom';
import type { CategoryResponse, TicketSummaryResponse } from '../../../types/api';
import { getResolutionSlaVisual } from '../sla';
import { getAssigneeLabel, resolveCategoryName, shortId } from '../presentation';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SlaTag } from './SlaTag';
import styles from './TicketCardList.module.css';

interface TicketCardListProps {
  tickets: TicketSummaryResponse[];
  categories: CategoryResponse[];
  currentUserId: string | undefined;
}

export function TicketCardList({ tickets, categories, currentUserId }: TicketCardListProps) {
  return (
    <div className={styles.list} role="list" aria-label="Chamados">
      {tickets.map((ticket) => (
        <Link key={ticket.id} to={`/tickets/${ticket.id}`} className={styles.card}>
          <div className={styles.topRow}>
            <span className={styles.id}>{shortId(ticket.id)}</span>
            <StatusBadge status={ticket.status} />
          </div>
          <p className={styles.title}>{ticket.title}</p>
          <div className={styles.bottomRow}>
            <PriorityBadge priority={ticket.priority} />
            <span>·</span>
            <span>{resolveCategoryName(categories, ticket.categoryId)}</span>
            <span>·</span>
            <span>{getAssigneeLabel(ticket.assignedAgentId, currentUserId)}</span>
          </div>
          <SlaTag visual={getResolutionSlaVisual(ticket.status, ticket.resolutionDueAt)} />
        </Link>
      ))}
    </div>
  );
}
