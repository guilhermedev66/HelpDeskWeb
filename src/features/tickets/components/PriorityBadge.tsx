import type { TicketPriority } from '../../../types/api';
import { PRIORITY_LABELS } from '../labels';
import styles from './Badge.module.css';

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  Low: styles['priority-low'],
  Medium: styles['priority-medium'],
  High: styles['priority-high'],
  Critical: styles['priority-critical'],
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`${styles.badge} ${PRIORITY_CLASS[priority]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
