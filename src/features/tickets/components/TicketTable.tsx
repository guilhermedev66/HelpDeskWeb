import { Link } from 'react-router-dom';
import type { CategoryResponse, TicketSummaryResponse } from '../../../types/api';
import { getResolutionSlaVisual } from '../sla';
import { getAssigneeLabel, resolveCategoryName, shortId } from '../presentation';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SlaTag } from './SlaTag';
import styles from './TicketTable.module.css';

interface TicketTableProps {
  tickets: TicketSummaryResponse[];
  categories: CategoryResponse[];
  currentUserId: string | undefined;
}

export function TicketTable({ tickets, categories, currentUserId }: TicketTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.desktopOnly}>ID</th>
            <th>Título</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th className={styles.desktopOnly}>Categoria</th>
            <th className={styles.desktopOnly}>Responsável</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className={`${styles.idCell} ${styles.desktopOnly}`}>{shortId(ticket.id)}</td>
              <td className={styles.titleCell}>
                <Link to={`/tickets/${ticket.id}`} className={styles.titleLink}>
                  {ticket.title}
                </Link>
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className={`${styles.secondary} ${styles.desktopOnly}`}>
                {resolveCategoryName(categories, ticket.categoryId)}
              </td>
              <td className={`${styles.secondary} ${styles.desktopOnly}`}>
                {getAssigneeLabel(ticket.assignedAgentId, currentUserId)}
              </td>
              <td>
                <SlaTag visual={getResolutionSlaVisual(ticket.status, ticket.resolutionDueAt)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
