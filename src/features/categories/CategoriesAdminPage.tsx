import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Input } from '../../components/Input/Input';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../lib/httpClient';
import { createCategory } from './api';
import { CategoryRow } from './CategoryRow';
import { categoryNameSchema, type CategoryNameFormValues } from './schema';
import { useCategoriesAdminQuery } from './useCategoriesAdminQuery';
import styles from './CategoriesAdminPage.module.css';

export function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const categoriesQuery = useCategoriesAdminQuery();
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isValidating },
  } = useForm<CategoryNameFormValues>({ resolver: zodResolver(categoryNameSchema) });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories', 'all'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]);
      reset();
      setIsCreating(false);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        return;
      }
      if (error instanceof NetworkError) {
        showToast(error.message, 'error');
        return;
      }
      setFormError('Ocorreu um erro inesperado. Tente novamente.');
    },
  });

  function onSubmit(values: CategoryNameFormValues) {
    setFormError(null);
    createMutation.mutate(values.name);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Categorias de chamados</h1>
          <p>Categorias inativas deixam de aceitar novos chamados, mas preservam o histórico.</p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => {
              setFormError(null);
              setIsCreating(true);
            }}
          >
            Nova categoria
          </Button>
        )}
      </div>

      {isCreating && (
        <form className={styles.createForm} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.createField}>
            <Input
              label="Nome da categoria"
              placeholder="Ex.: Impressoras"
              errorMessage={errors.name?.message ?? formError ?? undefined}
              {...register('name')}
            />
          </div>
          <Button type="submit" isLoading={isValidating || createMutation.isPending}>
            Criar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setFormError(null);
              setIsCreating(false);
            }}
          >
            Cancelar
          </Button>
        </form>
      )}

      {categoriesQuery.isLoading && (
        <div className={styles.table}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <Skeleton />
            </div>
          ))}
        </div>
      )}

      {categoriesQuery.isError && (
        <div className={styles.errorBox} role="alert">
          <p>Não foi possível carregar as categorias. Tente novamente.</p>
          <Button variant="secondary" size="small" onClick={() => categoriesQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {categoriesQuery.data && categoriesQuery.data.length === 0 && (
        <EmptyState title="Nenhuma categoria cadastrada" description="Crie a primeira categoria acima." />
      )}

      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span className={styles.colName}>Nome</span>
            <span className={styles.colStatus}>Status</span>
            <span className={styles.colDate}>Criada em</span>
            <span className={styles.colActions} />
          </div>
          {categoriesQuery.data.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
