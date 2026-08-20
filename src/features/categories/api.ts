import { apiRequest } from '../../lib/httpClient';
import type { CategoryDetailsResponse } from '../../types/api';

export function listAllCategories(): Promise<CategoryDetailsResponse[]> {
  return apiRequest<CategoryDetailsResponse[]>('/categories/all');
}

export function createCategory(name: string): Promise<CategoryDetailsResponse> {
  return apiRequest<CategoryDetailsResponse>('/categories', { method: 'POST', body: { name } });
}

export function renameCategory(categoryId: string, name: string): Promise<CategoryDetailsResponse> {
  return apiRequest<CategoryDetailsResponse>(`/categories/${categoryId}`, {
    method: 'PATCH',
    body: { name },
  });
}

export function changeCategoryStatus(
  categoryId: string,
  isActive: boolean,
): Promise<CategoryDetailsResponse> {
  return apiRequest<CategoryDetailsResponse>(`/categories/${categoryId}/status`, {
    method: 'PATCH',
    body: { isActive },
  });
}
