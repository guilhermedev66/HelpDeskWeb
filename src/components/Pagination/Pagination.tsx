import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Gera 1, [...], page-1, page, page+1, [...], totalPages — sem se repetir. */
function buildPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  for (const [index, p] of sorted.entries()) {
    if (index > 0 && p - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(p);
  }
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Paginação">
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {buildPageList(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === page ? `${styles.pageButton} ${styles.current}` : styles.pageButton}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Página ${item}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
  );
}
