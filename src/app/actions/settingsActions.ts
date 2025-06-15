
'use server';
/**
 * @fileOverview Server actions for managing site-wide settings from Supabase.
 *
 * - getSiteSettings - Fetches current site settings from Supabase.
 * - updateSiteSettings - Updates site settings in Supabase.
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';
import type { SiteSettings } from '@/types/settings';
import { SiteSettingsSchema } from '@/types/settings';

// Default settings to be used if nothing is found in the database
const defaultSettings: SiteSettings = {
  siteName: 'Nuvyra Store',
  defaultSeoTitle: 'Nuvyra Store: Tênis Importados da China 1:1 - Qualidade e Estilo',
  defaultSeoDescription: 'Explore a Nuvyra Store, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados.',
  seoKeywords: ['tênis importados', 'qualidade 1:1', 'Nuvyra Store', 'réplicas premium'],
};

const SETTINGS_ROW_ID = 1; // The ID for the single row of settings

// Helper function to get the Supabase auth cookie name
const getSupabaseAuthCookieName = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('[settingsActions:getSupabaseAuthCookieName] NEXT_PUBLIC_SUPABASE_URL is not defined. Using generic cookie name.');
    return `sb-unknown-auth-token`;
  }
   try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) {
      console.warn('[settingsActions:getSupabaseAuthCookieName] Could not derive projectRef from NEXT_PUBLIC_SUPABASE_URL. Using default pattern.');
      return `sb-unknown-auth-token`;
    }
    return `sb-${projectRef}-auth-token`;
  } catch (e) {
    console.error('[settingsActions:getSupabaseAuthCookieName] Error parsing Supabase URL:', e);
    return `sb-error-parsing-url-auth-token`;
  }
};


export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // For public settings, a non-authenticated client might be okay if RLS allows anon reads.
    // Using createServerActionClient is fine.
    const supabase = createServerActionClient<Database>({ cookies });
    const { data, error } = await supabase
      .from('site_settings')
      .select('site_name, default_seo_title, default_seo_description, seo_keywords')
      .eq('id', SETTINGS_ROW_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        console.warn('No site settings found in database, returning default values. Admin save will create the row.');
        return defaultSettings;
      }
      console.error('Supabase error fetching site settings:', error);
      return defaultSettings; // Fallback to defaults on other errors
    }

    if (data) {
      return {
        siteName: data.site_name,
        defaultSeoTitle: data.default_seo_title,
        defaultSeoDescription: data.default_seo_description,
        seoKeywords: data.seo_keywords,
      };
    }
  } catch (e) {
    console.error("Unexpected error in getSiteSettings:", e);
    return defaultSettings; // Fallback to defaults on unexpected errors
  }
  return defaultSettings; // Fallback if data is null for some reason
}

export async function updateSiteSettings(newSettings: SiteSettings): Promise<{ success: boolean; message: string; settings?: SiteSettings }> {
  let supabase;
  const cookieStore = cookies(); // Get the cookie store function

  const authCookieName = getSupabaseAuthCookieName();
  const specificAuthCookie = cookieStore.get(authCookieName);
  let cookieDebugMessage = `Cookie '${authCookieName}' `;
  cookieDebugMessage += specificAuthCookie ? `ENCONTRADO.` : `NÃO ENCONTRADO.`;

  console.log(`--- [updateSiteSettings Action] --- Cookie check: ${cookieDebugMessage}`);

  try {
    supabase = createServerActionClient<Database>({ cookies: cookieStore }); // Pass the cookieStore
  } catch (clientError) {
    console.error('ACTION_CRITICAL_ERROR: Failed to create Supabase client in updateSiteSettings:', clientError);
    return { success: false, message: `Erro crítico ao inicializar o cliente de banco de dados. ${cookieDebugMessage}` };
  }

  let user;
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('ACTION_AUTH_ERROR: Supabase error getting user in updateSiteSettings:', authError);
      return { success: false, message: `Erro de autenticação: ${authError.message}. ${cookieDebugMessage}` };
    }
    if (!authUser) {
      return { success: false, message: `Ação não autorizada. Usuário não autenticado. ${cookieDebugMessage} Detalhe: Auth session missing!` };
    }
    user = authUser; // User is authenticated
    console.log(`--- [updateSiteSettings Action] --- User authenticated: ${user.id}`);
  } catch (e) {
    console.error('ACTION_UNEXPECTED_AUTH_ERROR: Unexpected error getting user in updateSiteSettings:', e);
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido durante a verificação de autenticação.';
    return { success: false, message: `Erro inesperado na autenticação: ${errorMessage}. ${cookieDebugMessage}` };
  }

  try {
    const validatedSettings = SiteSettingsSchema.parse(newSettings);

    const { data: upsertedData, error: upsertError } = await supabase
      .from('site_settings')
      .upsert(
        {
          id: SETTINGS_ROW_ID,
          site_name: validatedSettings.siteName,
          default_seo_title: validatedSettings.defaultSeoTitle,
          default_seo_description: validatedSettings.defaultSeoDescription,
          seo_keywords: validatedSettings.seoKeywords,
          // updated_at should be handled by the database trigger or default value
        },
        {
          onConflict: 'id', 
        }
      )
      .select('site_name, default_seo_title, default_seo_description, seo_keywords')
      .single();

    if (upsertError) {
      console.error('ACTION_DB_ERROR: Supabase error updating site settings:', upsertError);
      if (upsertError.message.includes('violates row-level security policy') || upsertError.message.includes('RLS')) {
        return { success: false, message: `Erro ao salvar: Violação da política de segurança (RLS). Detalhe: ${upsertError.message}` };
      }
      return { success: false, message: `Erro ao salvar no banco de dados: ${upsertError.message}` };
    }
    
    if (!upsertedData) {
      return { success: false, message: 'Não foi possível salvar. Nenhum dado retornado após a operação.' };
    }

    revalidatePath('/'); 
    revalidatePath('/admin/configuracoes');

    const returnedSettings: SiteSettings = {
        siteName: upsertedData.site_name,
        defaultSeoTitle: upsertedData.default_seo_title,
        defaultSeoDescription: upsertedData.default_seo_description,
        seoKeywords: upsertedData.seo_keywords,
    };
    console.log("--- [updateSiteSettings Action] --- Settings updated successfully.");
    return { success: true, message: 'Configurações do site atualizadas com sucesso!', settings: returnedSettings };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('ACTION_VALIDATION_ERROR: Validation error updating site settings:', error.flatten());
      return { success: false, message: 'Erro de validação: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    console.error('ACTION_UNEXPECTED_ERROR: Unexpected error updating site settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao atualizar.';
    return { success: false, message: errorMessage };
  }
}
