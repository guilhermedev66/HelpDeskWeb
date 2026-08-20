import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { useToast } from '../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../lib/httpClient';
import { safeRedirectPath } from '../../lib/safeRedirect';
import { useAuth } from './useAuth';
import { loginSchema, type LoginFormValues } from './schema';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (status === 'authenticated') {
    const redirectTo = safeRedirectPath(new URLSearchParams(location.search).get('redirect'));
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      const redirectTo = safeRedirectPath(new URLSearchParams(location.search).get('redirect'));
      navigate(redirectTo, { replace: true });
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
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Help Desk</h1>
          <p className={styles.subtitle}>Entre para acompanhar e gerenciar chamados.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            errorMessage={errors.password?.message}
            {...register('password')}
          />

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" className={styles.submit} isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <p className={styles.footer}>
          Ainda não tem conta? <Link to={`/register${location.search}`}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
