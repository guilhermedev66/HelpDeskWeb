import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { useToast } from '../../components/Toast/useToast';
import { ApiError, NetworkError } from '../../lib/httpClient';
import { safeRedirectPath } from '../../lib/safeRedirect';
import { useSlowRequestNotice } from '../../lib/useSlowRequestNotice';
import { AuthHero } from './AuthHero';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from './icons';
import { useAuth } from './useAuth';
import { loginSchema, type LoginFormValues } from './schema';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const isSlow = useSlowRequestNotice(isSubmitting, 4000);

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
      <AuthHero />

      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Bem-vindo de volta</h1>
            <p className={styles.subtitle}>Entre para acompanhar e gerenciar chamados.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              errorMessage={errors.email?.message}
              leadingIcon={<MailIcon />}
              {...register('email')}
            />
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              errorMessage={errors.password?.message}
              leadingIcon={<LockIcon />}
              trailingAction={
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
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
            {isSlow && (
              <p className={styles.coldStart} role="status" aria-live="polite">
                Estamos iniciando o servidor de demonstração… a primeira conexão pode levar alguns segundos
                porque a hospedagem gratuita "dorme" o back-end quando ele fica sem uso.
              </p>
            )}
          </form>

          <p className={styles.footer}>
            Ainda não tem conta? <Link to={`/register${location.search}`}>Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
