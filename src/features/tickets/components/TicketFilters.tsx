import type { CategoryResponse, TicketPriority, TicketStatus } from '../../../types/api';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '../labels';
import styles from './TicketFilters.module.css';

export interface TicketFiltersValue {
  status: TicketStatus | '';
  priority: TicketPriority | '';
  categoryId: string;
  search: string;
}

interface TicketFiltersProps {
  value: TicketFiltersValue;
  categories: CategoryResponse[];
  onSearchInputChange: (text: string) => void;
  onStatusChange: (status: TicketStatus | '') => void;
  onPriorityChange: (priority: TicketPriority | '') => void;
  onCategoryChange: (categoryId: string) => void;
  onClear: () => void;
}

export function TicketFilters({
  value,
  categories,
  onSearchInputChange,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClear,
}: TicketFiltersProps) {
  const hasActiveFilters = Boolean(value.status || value.priority || value.categoryId || value.search);

  return (
    <div className={styles.row} role="search">
      <div className={styles.searchField}>
        <label htmlFor="ticket-search" className={styles.srOnlyLabel}>
          Buscar por título ou descrição
        </label>
        <input
          id="ticket-search"
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por título ou descrição"
          value={value.search}
          onChange={(event) => onSearchInputChange(event.target.value)}
        />
      </div>

      <label htmlFor="ticket-status-filter" className={styles.srOnlyLabel}>
        Status
      </label>
      <select
        id="ticket-status-filter"
        className={styles.select}
        value={value.status}
        onChange={(event) => onStatusChange(event.target.value as TicketStatus | '')}
      >
        <option value="">Todos os status</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <label htmlFor="ticket-priority-filter" className={styles.srOnlyLabel}>
        Prioridade
      </label>
      <select
        id="ticket-priority-filter"
        className={styles.select}
        value={value.priority}
        onChange={(event) => onPriorityChange(event.target.value as TicketPriority | '')}
      >
        <option value="">Todas as prioridades</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      <label htmlFor="ticket-category-filter" className={styles.srOnlyLabel}>
        Categoria
      </label>
      <select
        id="ticket-category-filter"
        className={styles.select}
        value={value.categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}
