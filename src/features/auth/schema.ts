import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.').max(256),
  password: z.string().min(1, 'Informe sua senha.').max(128),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
