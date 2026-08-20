import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { useToast } from '../../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../../lib/httpClient';
import { addTicketComment } from '../api';
import { commentSchema, type CommentFormValues } from '../schema';
import styles from './CommentForm.module.css';

export function CommentForm({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema) });

  async function onSubmit(values: CommentFormValues) {
    setFormError(null);
    try {
      // Sem inserção otimista: só refletimos o comentário depois da API confirmar,
      // evitando duplicar/errar caso o servidor rejeite (403/404/400).
      await addTicketComment(ticketId, values);
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId, 'comments'] });
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
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
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="comment-body" className={styles.notice}>
        Comentário
      </label>
      <textarea
        id="comment-body"
        className={styles.textarea}
        placeholder="Escreva um comentário..."
        aria-invalid={Boolean(errors.body) || undefined}
        aria-describedby={errors.body ? 'comment-body-error' : undefined}
        {...register('body')}
      />
      {errors.body && (
        <p id="comment-body-error" className={styles.errorMessage} role="alert">
          {errors.body.message}
        </p>
      )}
      {formError && (
        <p className={styles.errorMessage} role="alert">
          {formError}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="submit" size="small" isLoading={isSubmitting}>
          Comentar
        </Button>
      </div>
    </form>
  );
}
