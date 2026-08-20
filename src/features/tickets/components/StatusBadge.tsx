import type { TicketStatus } from '../../../types/api';
import { STATUS_LABELS } from '../labels';
import styles from './Badge.module.css';

const STATUS_CLASS: Record<TicketStatus, string> = {
  Open: styles['status-open'],
  InProgress: styles['status-in-progress'],
  WaitingForUser: styles['status-waiting'],
  Resolved: styles['status-resolved'],
  Closed: styles['status-closed'],
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>{STATUS_LABELS[status]}</span>;
}
