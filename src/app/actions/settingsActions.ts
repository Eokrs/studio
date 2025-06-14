
'use server';
/**
 * @fileOverview Server actions for managing site-wide settings from Supabase.
 *
 * - SiteSettings - Interface for site settings.
 * - getSiteSettings - Fetches current site settings from Supabase.
 * - updateSiteSettings - Updates site settings in Supabase.
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase'; // Import Supabase client

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(3, 'O nome do site deve ter pelo menos 3 caracteres.').max(50, 'O nome do site não pode exceder 50 caracteres.'),
  defaultSeoTitle: z.string().min(10, 'O título SEO deve ter pelo menos 10 caracteres.').max(70, 'O título SEO não pode exceder 70 caracteres.'),
  defaultSeoDescription: z.string().min(20, 'A descrição SEO deve ter pelo menos 20 caracteres.').max(160, 'A descrição SEO não pode exceder 160 caracteres.'),
  seoKeywords: z.array(z.string().min(2, 'Cada palavra-chave deve ter pelo menos 2 caracteres.')).min(1, 'Forneça ao menos uma palavra-chave.'),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

// Default settings to be used if nothing is found in the database
const defaultSettings: SiteSettings = {
  siteName: 'Nuvyra Store',
  defaultSeoTitle: 'Nuvyra Store: Tênis Importados da China 1:1 - Qualidade e Estilo',
  defaultSeoDescription: 'Explore a Nuvyra Store, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados.',
  seoKeywords: ['tênis importados', 'qualidade 1:1', 'Nuvyra Store', 'réplicas premium'],
};

const SETTINGS_ROW_ID = 1; // The ID for the single row of settings

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('site_name, default_seo_title, default_seo_description, seo_keywords')
    .eq('id', SETTINGS_ROW_ID)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PGRST116: "Searched for a single row, but 0 rows were found"
      console.warn('No site settings found in database, returning default values. Admin save will create the row.');
      return defaultSettings;
    }
    console.error('Supabase error fetching site settings:', error);
    // Fallback to default settings in case of other errors, but log it.
    // Consider how critical it is for your app if settings can't be fetched.
    // For now, returning defaults to prevent admin page from breaking.
    return defaultSettings;
  }

  if (data) {
    // Map Supabase column names to our SiteSettings type (they match here but good practice)
    return {
      siteName: data.site_name,
      defaultSeoTitle: data.default_seo_title,
      defaultSeoDescription: data.default_seo_description,
      seoKeywords: data.seo_keywords,
    };
  }

  // Should be caught by error handling, but as a final fallback
  return defaultSettings;
}

export async function updateSiteSettings(newSettings: SiteSettings): Promise<{ success: boolean; message: string; settings?: SiteSettings }> {
  try {
    const validatedSettings = SiteSettingsSchema.parse(newSettings);

    const { data: upsertedData, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          id: SETTINGS_ROW_ID,
          site_name: validatedSettings.siteName,
          default_seo_title: validatedSettings.defaultSeoTitle,
          default_seo_description: validatedSettings.defaultSeoDescription,
          seo_keywords: validatedSettings.seoKeywords,
          // created_at and updated_at are handled by the database
        },
        {
          onConflict: 'id', // If row with id=1 exists, update it
        }
      )
      .select('site_name, default_seo_title, default_seo_description, seo_keywords')
      .single();

    if (error) {
      console.error('Supabase error updating site settings:', error);
      return { success: false, message: `Erro ao salvar configurações no banco de dados: ${error.message}` };
    }
    
    if (!upsertedData) {
      return { success: false, message: 'Não foi possível salvar as configurações. Nenhum dado retornado após a operação.' };
    }

    revalidatePath('/'); // Revalidate public pages that might use these settings
    revalidatePath('/admin/configuracoes'); // Revalidate the settings page itself

    const returnedSettings: SiteSettings = {
        siteName: upsertedData.site_name,
        defaultSeoTitle: upsertedData.default_seo_title,
        defaultSeoDescription: upsertedData.default_seo_description,
        seoKeywords: upsertedData.seo_keywords,
    };

    return { success: true, message: 'Configurações do site atualizadas com sucesso no banco de dados!', settings: returnedSettings };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error updating site settings:', error.flatten());
      return { success: false, message: 'Erro de validação: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    console.error('Unexpected error updating site settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao atualizar as configurações.';
    return { success: false, message: errorMessage };
  }
}
