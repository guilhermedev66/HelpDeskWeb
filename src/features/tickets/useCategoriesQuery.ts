import { useQuery } from '@tanstack/react-query';
import { listCategories } from './api';

/** Categorias ativas mudam raramente — cache generoso evita refetch a cada navegação. */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
}
