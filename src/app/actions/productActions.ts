
'use server';
/**
 * @fileOverview Server actions for fetching and managing product data from Supabase.
 *
 * - getProducts - Fetches products with optional pagination, ensuring they are active and valid.
 * - getProductById - Fetches a single product by its ID.
 * - getCategories - Fetches all unique active product categories with their counts, based on valid products.
 * - searchProductsByName - Fetches products matching a search query.
 */
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; 
import type { Database } from '@/lib/supabase';
import type { Product } from '@/data/products';

export async function getProducts(options?: { limit?: number; offset?: number }): Promise<Product[]> {
  const supabase = createServerActionClient<Database>({ cookies });

  let query = supabase
    .from('products')
    .select('id, name, description, image, category, price, created_at, is_active')
    .eq('is_active', true)
    .not('name', 'is', null)
    .filter('name', 'neq', '')
    .not('image', 'is', null)
    .filter('image', 'neq', '')
    .not('category', 'is', null)
    .filter('category', 'neq', '')
    .not('price', 'is', null)
    .order('created_at', { ascending: false });

  // Only apply a range limit if options are explicitly provided
  if (options?.limit) {
    const { limit = 20, offset = 0 } = options;
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error fetching products:', error);
    let detailedMessage = `Não foi possível carregar os produtos. Erro do Supabase: "${error.message}".`;
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      const missingColumnMatch = error.message.match(/column "(.+?)" does not exist/);
      const missingColumn = missingColumnMatch ? missingColumnMatch[1] : "desconhecida";
      detailedMessage += ` Parece que a coluna '${missingColumn}' está faltando na sua tabela 'products' ou tem um nome diferente do esperado. Verifique o arquivo 'supabase_schema.sql' e garanta que sua tabela no Supabase foi criada corretamente com todas as colunas, como por exemplo '${missingColumn} NUMERIC'.`;
    }
    detailedMessage += " Verifique os logs do servidor para detalhes e confirme suas políticas de Row Level Security (RLS) para a tabela 'products'. Consulte SUPABASE_TROUBLESHOOTING.md.";
    throw new Error(detailedMessage);
  }

  return data as Product[] || [];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = createServerActionClient<Database>({ cookies });
  if (!productId) {
    console.error('Get product by ID error: productId is undefined or null');
    return null;
  }
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category, price, is_active, created_at') // Added price
    .eq('id', productId)
    .single();

  if (error) {
    console.error(`Supabase error fetching product with ID ${productId}:`, error);
    return null;
  }
  return data as Product | null;
}


export async function getCategories(): Promise<Array<{ name: string; count: number }>> {
  const supabase = createServerActionClient<Database>({ cookies });
  
  const { data: validProductsForCategories, error: productsError } = await supabase
    .from('products')
    .select('category, name, image, price') // Added price for completeness check
    .eq('is_active', true)
    .not('name', 'is', null)
    .filter('name', 'neq', '')
    .not('image', 'is', null)
    .filter('image', 'neq', '')
    .not('category', 'is', null)
    .filter('category', 'neq', '')
    .not('price', 'is', null); // Ensure price is not null for category grouping

  if (productsError) {
    console.error('Supabase error fetching products for category count:', productsError);
    throw new Error(`Não foi possível carregar as categorias. Erro do Supabase: "${productsError.message}". Verifique os logs do servidor e as políticas RLS.`);
  }

  if (!validProductsForCategories) {
    return [];
  }

  const categoryCounts: Record<string, number> = {};
  for (const product of validProductsForCategories) {
    const cleanedCategory = product.category.trim();
    categoryCounts[cleanedCategory] = (categoryCounts[cleanedCategory] || 0) + 1;
  }

  const categoriesWithCounts = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name)); 

  return categoriesWithCounts;
}


export async function searchProductsByName(query: string): Promise<Product[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  if (!query || query.trim() === "") {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category, price, is_active, created_at') // Added price
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .not('name', 'is', null).filter('name', 'neq', '')
    .not('image', 'is', null).filter('image', 'neq', '')
    .not('category', 'is', null).filter('category', 'neq', '')
    .not('price', 'is', null) // Ensure price is not null
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Supabase search error:', error);
    return [];
  }
  return data as Product[] || [];
}
