
'use server';
/**
 * @fileOverview Server actions for fetching gallery image data.
 *
 * - getGalleryImages - Fetches all gallery images.
 */
import { galleryImages } from '@/data/galleryImages';
import type { GalleryImage } from '@/data/galleryImages';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  // In a real scenario, this would fetch from a database
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
  return galleryImages;
}
