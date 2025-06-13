
'use server';
/**
 * @fileOverview Server actions for fetching product data from Supabase.
 *
 * - getProducts - Fetches all active products, ordered by creation date.
 * - getCategories - Fetches all unique active product categories.
 * - searchProductsByName - Fetches products matching a search query.
 */
import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/products'; // Product interface

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay for demonstration, remove in production
  // await new Promise(resolve => setTimeout(resolve, 700)); 

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category, created_at, is_active') // Explicitly list columns
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching products:', error);
    // Throw a more informative error to the client
    let detailedMessage = `Não foi possível carregar os produtos. Erro do Supabase: "${error.message}".`;
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      const missingColumnMatch = error.message.match(/column "(.+?)" does not exist/);
      const missingColumn = missingColumnMatch ? missingColumnMatch[1] : "desconhecida";
      detailedMessage += ` Parece que a coluna '${missingColumn}' está faltando na sua tabela 'products' ou tem um nome diferente do esperado. Verifique o arquivo 'supabase_schema.sql' e garanta que sua tabela no Supabase foi criada corretamente com todas as colunas, como por exemplo '${missingColumn} TEXT'.`;
    }
    detailedMessage += " Verifique os logs do servidor para detalhes e confirme suas políticas de Row Level Security (RLS) para a tabela 'products'. Consulte SUPABASE_TROUBLESHOOTING.md.";
    throw new Error(detailedMessage);
  }

  return data as Product[];
}

export async function getCategories(): Promise<string[]> {
  // Simulate network delay for demonstration, remove in production
  // await new Promise(resolve => setTimeout(resolve, 300));
  
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Supabase error fetching categories:', error);
    throw new Error(`Não foi possível carregar as categorias. Erro do Supabase: "${error.message}". Verifique os logs do servidor e as políticas RLS.`);
  }

  if (!data) {
    return [];
  }

  // Get unique categories and sort them
  const uniqueCategories = [...new Set(data.map((item: { category: string }) => item.category))];
  return uniqueCategories.sort();
}

export async function searchProductsByName(query: string): Promise<Product[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category') // Ensure 'image' is selected for display
    .ilike('name', `%${query}%`) // Search in product name (case-insensitive)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) // Optional: order search results
    .limit(5); // Limit results for the dropdown

  if (error) {
    console.error('Supabase search error:', error);
    // Don't throw an error that breaks the app, just return empty or log
    // For a search dropdown, it's often better to return empty than throw
    return []; 
  }
  return data as Product[] || [];
}
