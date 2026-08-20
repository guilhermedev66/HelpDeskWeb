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
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from './icons';
import { useAuth } from './useAuth';
import { registerSchema, type RegisterFormValues } from './schema';
import styles from './LoginPage.module.css';

function messagesFromApiError(error: ApiError): string[] {
  if (error.fieldErrors) return Object.values(error.fieldErrors).flat();
  return [error.message];
}

export function RegisterPage() {
  const { status, registerAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const isSlow = useSlowRequestNotice(isSubmitting, 4000);

  if (status === 'authenticated') {
    const redirectTo = safeRedirectPath(new URLSearchParams(location.search).get('redirect'));
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: RegisterFormValues) {
    setFormErrors([]);
    try {
      await registerAccount(values.email, values.displayName, values.password);
      const redirectTo = safeRedirectPath(new URLSearchParams(location.search).get('redirect'));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormErrors(messagesFromApiError(error));
        return;
      }
      if (error instanceof NetworkError) {
        showToast(error.message, 'error');
        return;
      }
      setFormErrors(['Ocorreu um erro inesperado. Tente novamente.']);
    }
  }

  return (
    <div className={styles.page}>
      <AuthHero />

      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Criar conta</h1>
            <p className={styles.subtitle}>Cadastre-se para abrir e acompanhar chamados.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="Nome completo"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              errorMessage={errors.displayName?.message}
              leadingIcon={<UserIcon />}
              {...register('displayName')}
            />
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
              autoComplete="new-password"
              placeholder="Mínimo de 12 caracteres"
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
            <Input
              label="Confirmar senha"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repita a senha"
              errorMessage={errors.confirmPassword?.message}
              leadingIcon={<LockIcon />}
              trailingAction={
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
              {...register('confirmPassword')}
            />

            {formErrors.length > 0 && (
              <div className={styles.formError} role="alert">
                {formErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <Button type="submit" className={styles.submit} isLoading={isSubmitting}>
              Criar conta
            </Button>
            {isSlow && (
              <p className={styles.coldStart} role="status" aria-live="polite">
                Estamos iniciando o servidor de demonstração… a primeira conexão pode levar alguns segundos
                porque a hospedagem gratuita "dorme" o back-end quando ele fica sem uso.
              </p>
            )}
          </form>

          <p className={styles.footer}>
            Já tem conta? <Link to={`/login${location.search}`}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
