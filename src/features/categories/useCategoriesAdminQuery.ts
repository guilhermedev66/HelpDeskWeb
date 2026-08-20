import { useQuery } from '@tanstack/react-query';
import { listAllCategories } from './api';

export function useCategoriesAdminQuery() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: listAllCategories,
  });
}
