
'use server';
/**
 * @fileOverview Server actions for fetching product data from Supabase.
 *
 * - getProducts - Fetches all active products, ordered by creation date.
 * - getCategories - Fetches all unique active product categories.
 */
import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/products'; // Product interface

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay for demonstration, remove in production
  // await new Promise(resolve => setTimeout(resolve, 700)); 

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category, dataAiHint, created_at, is_active') // Explicitly list columns
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching products:', error);
    // Throw a more informative error to the client
    let detailedMessage = `Não foi possível carregar os produtos. Erro do Supabase: "${error.message}".`;
    if (error.message.includes("column products.dataAiHint does not exist")) {
      detailedMessage += " Parece que a coluna 'dataAiHint' está faltando na sua tabela 'products'. Verifique o arquivo 'supabase_schema.sql' e garanta que sua tabela no Supabase foi criada corretamente com todas as colunas, incluindo 'dataAiHint TEXT'.";
    }
    detailedMessage += " Verifique os logs do servidor para detalhes e confirme suas políticas de Row Level Security (RLS) para a tabela 'products'. Consulte SUPABASE_TROUBLESHOOTING.md.";
    throw new Error(detailedMessage);
  }

  // The data from Supabase should match the Product interface.
  // If there are discrepancies (e.g., created_at or is_active not needed in ProductCard),
  // you can map the data here or ensure the Product interface is flexible.
  // For now, assuming direct compatibility or that ProductCard ignores extra fields.
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

