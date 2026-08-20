import { z } from 'zod';

// Limites espelham CreateTicketRequest (C:\dev\HelpDeskAPI\...\Contracts\Tickets\CreateTicketRequest.cs).
export const createTicketSchema = z.object({
  title: z.string().min(1, 'Informe um título.').max(150, 'Título deve ter no máximo 150 caracteres.'),
  description: z
    .string()
    .min(1, 'Descreva o problema.')
    .max(4000, 'Descrição deve ter no máximo 4000 caracteres.'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical'], { message: 'Selecione uma prioridade.' }),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
