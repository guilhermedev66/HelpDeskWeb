import type { TicketCommentResponse } from '../../../types/api';
import { formatDateTime } from '../dates';
import styles from './CommentList.module.css';

export function CommentList({ comments }: { comments: TicketCommentResponse[] }) {
  if (comments.length === 0) {
    return <p className={styles.date}>Nenhum comentário ainda.</p>;
  }

  return (
    <ul className={styles.list}>
      {comments.map((comment) => (
        <li key={comment.id} className={styles.comment}>
          <div className={styles.head}>
            <span className={styles.author}>{comment.authorDisplayName}</span>
            <span className={styles.date}>{formatDateTime(comment.createdAt)}</span>
          </div>
          <p className={styles.body}>{comment.body}</p>
        </li>
      ))}
    </ul>
  );
}
