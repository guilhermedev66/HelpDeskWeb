import type { TicketHistoryResponse } from '../../../types/api';
import { formatDateTime } from '../dates';
import { describeHistoryEntry } from '../history';
import styles from './HistoryTimeline.module.css';

interface HistoryTimelineProps {
  entries: TicketHistoryResponse[];
  currentUserId: string | undefined;
}

export function HistoryTimeline({ entries, currentUserId }: HistoryTimelineProps) {
  if (entries.length === 0) {
    return <p className={styles.date}>Sem histórico.</p>;
  }

  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <div className={styles.head}>
            <span className={styles.actor}>{entry.actorDisplayName}</span>
            <span className={styles.date}>{formatDateTime(entry.occurredAt)}</span>
          </div>
          <span className={styles.description}>{describeHistoryEntry(entry, currentUserId)}</span>
        </li>
      ))}
    </ul>
  );
}
