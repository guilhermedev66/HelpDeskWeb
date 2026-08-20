import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/Button/Button';
import { ApiError, NetworkError } from '../../lib/httpClient';
import { useToast } from '../../components/Toast/useToast';
import type { CategoryDetailsResponse } from '../../types/api';
import { changeCategoryStatus, renameCategory } from './api';
import styles from './CategoryRow.module.css';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function CategoryRow({ category }: { category: CategoryDetailsResponse }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function invalidateLists() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories', 'all'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
    ]);
  }

  function handleError(error: unknown) {
    if (error instanceof ApiError) {
      setErrorMessage(error.message);
      return;
    }
    if (error instanceof NetworkError) {
      showToast(error.message, 'error');
      return;
    }
    setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
  }

  const renameMutation = useMutation({
    mutationFn: (name: string) => renameCategory(category.id, name),
    onSuccess: async () => {
      await invalidateLists();
      setIsRenaming(false);
    },
    onError: handleError,
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => changeCategoryStatus(category.id, isActive),
    onSuccess: async () => {
      await invalidateLists();
      setConfirmingDeactivate(false);
    },
    onError: handleError,
  });

  function startRename() {
    setErrorMessage(null);
    setNameDraft(category.name);
    setIsRenaming(true);
  }

  function submitRename() {
    setErrorMessage(null);
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === category.name) {
      setIsRenaming(false);
      return;
    }
    renameMutation.mutate(trimmed);
  }

  return (
    <div className={styles.row}>
      {isRenaming ? (
        <input
          className={styles.renameInput}
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          aria-label={`Novo nome para ${category.name}`}
          autoFocus
        />
      ) : (
        <span className={styles.name}>{category.name}</span>
      )}

      <span className={`${styles.badge} ${category.isActive ? styles.active : styles.inactive}`}>
        {category.isActive ? 'Ativa' : 'Inativa'}
      </span>

      <span className={styles.date}>{dateFormatter.format(new Date(category.createdAt))}</span>

      <div className={styles.actions}>
        {isRenaming ? (
          <>
            <button
              type="button"
              className={styles.linkButton}
              onClick={submitRename}
              disabled={renameMutation.isPending}
            >
              Salvar
            </button>
            <button type="button" className={styles.linkButton} onClick={() => setIsRenaming(false)}>
              Cancelar
            </button>
          </>
        ) : confirmingDeactivate ? (
          <div className={styles.confirmBox}>
            <span>Desativar?</span>
            <Button
              size="small"
              variant="danger"
              isLoading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(false)}
            >
              Sim
            </Button>
            <Button variant="ghost" size="small" onClick={() => setConfirmingDeactivate(false)}>
              Não
            </Button>
          </div>
        ) : (
          <>
            <button type="button" className={styles.linkButton} onClick={startRename}>
              Renomear
            </button>
            {category.isActive ? (
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setErrorMessage(null);
                  setConfirmingDeactivate(true);
                }}
              >
                Desativar
              </button>
            ) : (
              <button
                type="button"
                className={styles.linkButton}
                disabled={statusMutation.isPending}
                onClick={() => {
                  setErrorMessage(null);
                  statusMutation.mutate(true);
                }}
              >
                Ativar
              </button>
            )}
          </>
        )}
      </div>

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
