import type { CategoryResponse } from '../../types/api';

/**
 * A API não expõe um diretório de usuários/agentes (só GET /api/auth/me, para o
 * próprio usuário) — não há como resolver AssignedAgentId para um nome. Por isso
 * mostramos só a relação com o usuário atual, sem inventar um nome de agente.
 */
export function getAssigneeLabel(assignedAgentId: string | null, currentUserId: string | undefined): string {
  if (!assignedAgentId) return 'Não atribuído';
  if (assignedAgentId === currentUserId) return 'Atribuído a você';
  return 'Atribuído';
}

/**
 * GET /api/categories só retorna categorias ativas. Um chamado ligado a uma
 * categoria desativada não aparece nesse mapa — mostramos "—" em vez de inventar
 * um nome ou esconder a coluna.
 */
export function resolveCategoryName(categories: CategoryResponse[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? '—';
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}
