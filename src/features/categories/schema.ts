import { z } from 'zod';

// Limite espelha CreateCategoryRequest/RenameCategoryRequest (StringLength(100, MinimumLength = 1)).
export const categoryNameSchema = z.object({
  name: z.string().min(1, 'Informe um nome.').max(100, 'Nome deve ter no máximo 100 caracteres.'),
});

export type CategoryNameFormValues = z.infer<typeof categoryNameSchema>;
