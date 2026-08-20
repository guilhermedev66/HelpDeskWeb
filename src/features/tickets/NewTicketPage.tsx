import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/Button/Button';
import { ButtonLink } from '../../components/Button/ButtonLink';
import { Input } from '../../components/Input/Input';
import { useToast } from '../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../lib/httpClient';
import { createTicket } from './api';
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from './labels';
import { createTicketSchema, type CreateTicketFormValues } from './schema';
import { useCategoriesQuery } from './useCategoriesQuery';
import styles from './NewTicketPage.module.css';

// Chaves do ValidationProblemDetails são os nomes das propriedades no back-end
// (CreateTicketRequest, C#/PascalCase) — mapeadas para os campos do formulário.
const FIELD_MAP: Record<string, keyof CreateTicketFormValues> = {
  Title: 'title',
  Description: 'description',
  Priority: 'priority',
  CategoryId: 'categoryId',
};

export function NewTicketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const categoriesQuery = useCategoriesQuery();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormValues>({ resolver: zodResolver(createTicketSchema) });

  async function onSubmit(values: CreateTicketFormValues) {
    setFormError(null);
    try {
      const ticket = await createTicket(values);
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(`/tickets/${ticket.id}`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const mappedFields = Object.entries(error.fieldErrors ?? {}).filter(([key]) => FIELD_MAP[key]);
        if (mappedFields.length > 0) {
          for (const [key, messages] of mappedFields) {
            setError(FIELD_MAP[key], { message: messages[0] });
          }
        } else {
          setFormError(error.message);
        }
        return;
      }
      if (error instanceof NetworkError) {
        showToast(error.message, 'error');
        return;
      }
      setFormError('Ocorreu um erro inesperado. Tente novamente.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <h1>Abrir novo chamado</h1>
          <p>Descreva o problema com o máximo de detalhes possível para agilizar o atendimento.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Título"
            placeholder="Ex.: Impressora do 3º andar não imprime"
            errorMessage={errors.title?.message}
            {...register('title')}
          />

          <div className={styles.field}>
            <label htmlFor="ticket-description">Descrição</label>
            <textarea
              id="ticket-description"
              className={styles.textarea}
              placeholder="Explique o que está acontecendo, quando começou e o que já foi tentado"
              aria-invalid={Boolean(errors.description) || undefined}
              aria-describedby={errors.description ? 'ticket-description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="ticket-description-error" className={styles.errorMessage} role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="ticket-category">Categoria</label>
              <select
                id="ticket-category"
                className={styles.select}
                aria-invalid={Boolean(errors.categoryId) || undefined}
                defaultValue=""
                {...register('categoryId')}
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categoriesQuery.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className={styles.errorMessage} role="alert">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="ticket-priority">Prioridade</label>
              <select
                id="ticket-priority"
                className={styles.select}
                aria-invalid={Boolean(errors.priority) || undefined}
                defaultValue="Medium"
                {...register('priority')}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className={styles.errorMessage} role="alert">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.actions}>
            <ButtonLink to="/tickets" variant="secondary">
              Cancelar
            </ButtonLink>
            <Button type="submit" isLoading={isSubmitting}>
              Criar chamado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
