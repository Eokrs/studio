/**
 * @fileOverview Types and schemas related to site settings.
 */

import { z } from 'zod';

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(3, 'O nome do site deve ter pelo menos 3 caracteres.').max(50, 'O nome do site não pode exceder 50 caracteres.'),
  defaultSeoTitle: z.string().min(10, 'O título SEO deve ter pelo menos 10 caracteres.').max(70, 'O título SEO não pode exceder 70 caracteres.'),
  defaultSeoDescription: z.string().min(20, 'A descrição SEO deve ter pelo menos 20 caracteres.').max(160, 'A descrição SEO não pode exceder 160 caracteres.'),
  seoKeywords: z.array(z.string().min(2, 'Cada palavra-chave deve ter pelo menos 2 caracteres.')).min(1, 'Forneça ao menos uma palavra-chave.'),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
