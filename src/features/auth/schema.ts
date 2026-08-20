import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.').max(256),
  password: z.string().min(1, 'Informe sua senha.').max(128),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Limites espelham RegisterRequest (C:\dev\HelpDeskAPI\src\HelpDesk.Api\Contracts\Authentication\RegisterRequest.cs).
export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Nome deve ter entre 2 e 120 caracteres.')
      .max(120, 'Nome deve ter entre 2 e 120 caracteres.'),
    email: z.email('Informe um e-mail válido.').max(256),
    password: z
      .string()
      .min(12, 'Senha deve ter no mínimo 12 caracteres.')
      .max(128, 'Senha deve ter no máximo 128 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
