
'use server';
/**
 * @fileOverview Server actions for managing site-wide settings.
 *
 * - SiteSettings - Interface for site settings.
 * - getSiteSettings - Fetches current site settings (mocked).
 * - updateSiteSettings - Updates site settings (mocked).
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(3, 'O nome do site deve ter pelo menos 3 caracteres.').max(50, 'O nome do site não pode exceder 50 caracteres.'),
  defaultSeoTitle: z.string().min(10, 'O título SEO deve ter pelo menos 10 caracteres.').max(70, 'O título SEO não pode exceder 70 caracteres.'),
  defaultSeoDescription: z.string().min(20, 'A descrição SEO deve ter pelo menos 20 caracteres.').max(160, 'A descrição SEO não pode exceder 160 caracteres.'),
  seoKeywords: z.array(z.string().min(2, 'Cada palavra-chave deve ter pelo menos 2 caracteres.')).min(1, 'Forneça ao menos uma palavra-chave.'),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

// Mock in-memory storage for site settings
let currentSettings: SiteSettings = {
  siteName: 'Nuvyra Store',
  defaultSeoTitle: 'Nuvyra Store: Tênis Importados da China 1:1 - Qualidade e Estilo',
  defaultSeoDescription: 'Explore a Nuvyra Store, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados.',
  seoKeywords: ['tênis importados', 'qualidade 1:1', 'Nuvyra Store', 'réplicas premium'],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  // In a real scenario, this would fetch from a database or a config file.
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return currentSettings;
}

export async function updateSiteSettings(newSettings: SiteSettings): Promise<{ success: boolean; message: string; settings?: SiteSettings }> {
  // In a real scenario, this would save to a database or a config file.
  // For now, we just update the in-memory mock and log it.
  console.log("Updating site settings to:", newSettings);
  try {
    const validatedSettings = SiteSettingsSchema.parse(newSettings);
    currentSettings = validatedSettings;
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Revalidate paths that might use this data.
    // Since this is global, revalidating the layout or home page might be good.
    revalidatePath('/');
    revalidatePath('/admin/configuracoes'); // Revalidate the settings page itself

    return { success: true, message: 'Configurações do site atualizadas com sucesso!', settings: currentSettings };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error updating site settings:', error.flatten());
      return { success: false, message: 'Erro de validação: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    console.error('Error updating site settings:', error);
    return { success: false, message: 'Ocorreu um erro desconhecido ao atualizar as configurações.' };
  }
}
