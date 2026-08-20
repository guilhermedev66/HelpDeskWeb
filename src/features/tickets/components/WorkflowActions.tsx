import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/Button/Button';
import { useToast } from '../../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../../lib/httpClient';
import type { TicketDetailsResponse, TicketPriority, TicketStatus } from '../../../types/api';
import { assignTicketToSelf, changeTicketPriority, changeTicketStatus } from '../api';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_LABELS } from '../labels';
import { ALLOWED_STATUS_TRANSITIONS } from '../workflow';
import styles from './WorkflowActions.module.css';

interface WorkflowActionsProps {
  ticket: TicketDetailsResponse;
  currentUserId: string | undefined;
  isAdmin: boolean;
}

export function WorkflowActions({ ticket, currentUserId, isAdmin }: WorkflowActionsProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [statusValue, setStatusValue] = useState<TicketStatus>(ticket.status);
  const [priorityValue, setPriorityValue] = useState<TicketPriority>(ticket.priority);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Se o chamado for recarregado (refetch, outra aba, retry pós-conflito), os selects
  // (estado local editável, não puramente derivado) acompanham o valor mais recente.
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => setStatusValue(ticket.status), [ticket.status]);
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => setPriorityValue(ticket.priority), [ticket.priority]);

  async function afterSuccess() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] }),
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id, 'history'] }),
      queryClient.invalidateQueries({ queryKey: ['tickets'] }),
    ]);
  }

  function handleError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        setConflict(true);
        return;
      }
      setActionError(error.message);
      return;
    }
    if (error instanceof NetworkError) {
      showToast(error.message, 'error');
      return;
    }
    setActionError('Ocorreu um erro inesperado. Tente novamente.');
  }

  const assignMutation = useMutation({
    mutationFn: () => assignTicketToSelf(ticket.id, ticket.version),
    onSuccess: afterSuccess,
    onError: handleError,
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => changeTicketStatus(ticket.id, status, ticket.version),
    onSuccess: afterSuccess,
    onError: handleError,
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: TicketPriority) => changeTicketPriority(ticket.id, priority, ticket.version),
    onSuccess: afterSuccess,
    onError: handleError,
  });

  function reload() {
    setConflict(false);
    void queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
  }

  async function handleSave() {
    setActionError(null);
    const changingStatus = statusValue !== ticket.status;
    const changingPriority = priorityValue !== ticket.priority;
    if (!changingStatus && !changingPriority) return;

    // Fechar é terminal (sem transição de volta) — pede confirmação antes de mandar pra API.
    if (changingStatus && statusValue === 'Closed' && !confirmingClose) {
      setConfirmingClose(true);
      return;
    }
    setConfirmingClose(false);

    try {
      if (changingStatus) await statusMutation.mutateAsync(statusValue);
      if (changingPriority) await priorityMutation.mutateAsync(priorityValue);
    } catch {
      // já tratado em handleError
    }
  }

  const canManage = isAdmin || ticket.assignedAgentId === currentUserId;
  const canAssign =
    ticket.status !== 'Closed' &&
    ticket.assignedAgentId !== currentUserId &&
    (isAdmin || ticket.assignedAgentId === null);
  const nextStatuses = ALLOWED_STATUS_TRANSITIONS[ticket.status];
  const isSaving = statusMutation.isPending || priorityMutation.isPending;
  const hasChanges = statusValue !== ticket.status || priorityValue !== ticket.priority;

  if (!canManage && !canAssign) {
    return <p className={styles.notice}>Assuma o chamado para gerenciar status e prioridade.</p>;
  }

  return (
    <div className={styles.wrap}>
      {conflict && (
        <div className={styles.conflictBox} role="alert">
          <p>Este chamado foi alterado por outra pessoa. Recarregue para ver os dados mais recentes.</p>
          <Button variant="secondary" size="small" onClick={reload}>
            Recarregar
          </Button>
        </div>
      )}

      {actionError && (
        <p className={styles.errorMessage} role="alert">
          {actionError}
        </p>
      )}

      {canAssign && (
        <Button
          variant="secondary"
          size="small"
          isLoading={assignMutation.isPending}
          onClick={() => {
            setActionError(null);
            assignMutation.mutate();
          }}
        >
          Assumir chamado
        </Button>
      )}

      {canManage && (
        <>
          {nextStatuses.length > 0 && (
            <div className={styles.field}>
              <label htmlFor="ticket-status-action">Status</label>
              <select
                id="ticket-status-action"
                className={styles.select}
                value={statusValue}
                onChange={(event) => setStatusValue(event.target.value as TicketStatus)}
              >
                <option value={ticket.status}>{STATUS_LABELS[ticket.status]}</option>
                {nextStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="ticket-priority-action">Prioridade</label>
            <select
              id="ticket-priority-action"
              className={styles.select}
              value={priorityValue}
              onChange={(event) => setPriorityValue(event.target.value as TicketPriority)}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          {confirmingClose ? (
            <div className={styles.confirmBox}>
              <p>Fechar o chamado é definitivo — não é possível reabrir depois. Confirma?</p>
              <div className={styles.confirmActions}>
                <Button variant="ghost" size="small" onClick={() => setConfirmingClose(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" size="small" isLoading={isSaving} onClick={handleSave}>
                  Confirmar fechamento
                </Button>
              </div>
            </div>
          ) : (
            <Button size="small" isLoading={isSaving} disabled={!hasChanges} onClick={handleSave}>
              Salvar alterações
            </Button>
          )}
        </>
      )}
    </div>
  );
}
