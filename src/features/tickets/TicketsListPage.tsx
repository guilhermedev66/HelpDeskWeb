import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { ButtonLink } from '../../components/Button/ButtonLink';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Pagination } from '../../components/Pagination/Pagination';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import type { TicketPriority, TicketStatus } from '../../types/api';
import { useAuth } from '../auth/useAuth';
import { TicketCardList } from './components/TicketCardList';
import { TicketFilters } from './components/TicketFilters';
import { TicketTable } from './components/TicketTable';
import { useCategoriesQuery } from './useCategoriesQuery';
import { useTicketsQuery } from './useTicketsQuery';
import styles from './TicketsListPage.module.css';

const PAGE_SIZE = 20;

export function TicketsListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get('status') ?? '') as TicketStatus | '';
  const priority = (searchParams.get('priority') ?? '') as TicketPriority | '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch === search) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function updateFilter(patch: Partial<Record<'status' | 'priority' | 'categoryId', string>>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  }

  const categoriesQuery = useCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const ticketsQuery = useTicketsQuery({
    status: status || undefined,
    priority: priority || undefined,
    categoryId: categoryId || undefined,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const isAgentOrAdmin = Boolean(user?.roles.some((role) => role === 'Agent' || role === 'Admin'));
  const heading = isAgentOrAdmin ? 'Fila de chamados' : 'Meus chamados';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>{heading}</h1>
          {ticketsQuery.data && (
            <p>
              {ticketsQuery.data.totalItems} chamado{ticketsQuery.data.totalItems === 1 ? '' : 's'} no total
            </p>
          )}
        </div>
        <ButtonLink to="/tickets/new">Novo chamado</ButtonLink>
      </div>

      <TicketFilters
        value={{ status, priority, categoryId, search: searchInput }}
        categories={categories}
        onSearchInputChange={setSearchInput}
        onStatusChange={(value) => updateFilter({ status: value })}
        onPriorityChange={(value) => updateFilter({ priority: value })}
        onCategoryChange={(value) => updateFilter({ categoryId: value })}
        onClear={clearFilters}
      />

      {ticketsQuery.isLoading && (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 6 }, (_, index) => (
            <div className={styles.skeletonRow} key={index}>
              <Skeleton width={80} />
              <Skeleton width="40%" />
              <Skeleton width={90} />
              <Skeleton width={70} />
            </div>
          ))}
        </div>
      )}

      {ticketsQuery.isError && (
        <div className={styles.errorBox} role="alert">
          <p>Não foi possível carregar os chamados. Tente novamente.</p>
          <Button variant="secondary" size="small" onClick={() => ticketsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {ticketsQuery.data && ticketsQuery.data.items.length === 0 && (
        <EmptyState
          title="Nenhum chamado encontrado"
          description="Ajuste os filtros ou crie um novo chamado."
        />
      )}

      {ticketsQuery.data && ticketsQuery.data.items.length > 0 && (
        <>
          <TicketTable tickets={ticketsQuery.data.items} categories={categories} currentUserId={user?.id} />
          <TicketCardList
            tickets={ticketsQuery.data.items}
            categories={categories}
            currentUserId={user?.id}
          />
          <div className={styles.footer}>
            <Pagination
              page={ticketsQuery.data.page}
              totalPages={ticketsQuery.data.totalPages}
              onPageChange={goToPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
