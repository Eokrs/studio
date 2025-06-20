
/**
 * @fileOverview Types and schemas related to site settings.
 */

import { z } from 'zod';

// SiteSettingsSchema is removed as it was primarily for admin form validation.
// The SiteSettings type is kept for getSiteSettings action.
export type SiteSettings = {
  siteName: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  seoKeywords: string[];
};
