
'use server';
/**
 * @fileOverview Server actions for managing site-wide settings from Supabase.
 *
 * - getSiteSettings - Fetches current site settings from Supabase.
 */

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';
import type { SiteSettings } from '@/types/settings';

const defaultSettings: SiteSettings = {
  siteName: 'Nuvyra Store',
  defaultSeoTitle: 'Nuvyra Store: Tênis Importados da China 1:1 - Qualidade e Estilo',
  defaultSeoDescription: 'Explore a Nuvyra Store, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados.',
  seoKeywords: ['tênis importados', 'qualidade 1:1', 'Nuvyra Store', 'réplicas premium'],
};

const SETTINGS_ROW_ID = 1; 

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createServerActionClient<Database>({ cookies });
    const { data, error } = await supabase
      .from('site_settings')
      .select('site_name, default_seo_title, default_seo_description, seo_keywords')
      .eq('id', SETTINGS_ROW_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        console.warn('No site settings found in database, returning default values.');
        return defaultSettings;
      }
      console.error('Supabase error fetching site settings:', error);
      return defaultSettings;
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
    return defaultSettings;
  }
  return defaultSettings;
}
