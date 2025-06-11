
'use server';
/**
 * @fileOverview Server actions for fetching product data.
 *
 * - getProducts - Fetches all products.
 * - getCategories - Fetches all product categories.
 */
import { products, categories } from '@/data/products';
import type { Product } from '@/data/products';

export async function getProducts(): Promise<Product[]> {
  // In a real scenario, this would fetch from a database
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
  return products;
}

export async function getCategories(): Promise<string[]> {
  // In a real scenario, this might also come from a database or be derived
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return categories;
}
