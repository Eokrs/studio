
'use server';
/**
 * @fileOverview Server actions for fetching and managing product data from Supabase.
 *
 * - getProducts - Fetches products with optional pagination.
 * - getProductById - Fetches a single product by its ID.
 * - getCategories - Fetches all unique active product categories.
 * - searchProductsByName - Fetches products matching a search query.
 * - deleteProduct - Deletes a product by its ID.
 * - updateProduct - Updates an existing product.
 */
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';
import type { Product, ProductUpdateData } from '@/data/products';
import { revalidatePath } from 'next/cache';

export async function getProducts(options?: { limit?: number; offset?: number }): Promise<Product[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from('products')
    .select('id, name, description, image, category, created_at, is_active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error fetching products:', error);
    let detailedMessage = `Não foi possível carregar os produtos. Erro do Supabase: "${error.message}".`;
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      const missingColumnMatch = error.message.match(/column "(.+?)" does not exist/);
      const missingColumn = missingColumnMatch ? missingColumnMatch[1] : "desconhecida";
      detailedMessage += ` Parece que a coluna '${missingColumn}' está faltando na sua tabela 'products' ou tem um nome diferente do esperado. Verifique o arquivo 'supabase_schema.sql' e garanta que sua tabela no Supabase foi criada corretamente com todas as colunas, como por exemplo '${missingColumn} TEXT'.`;
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
    .select('id, name, description, image, category, is_active, created_at')
    .eq('id', productId)
    .single();

  if (error) {
    console.error(`Supabase error fetching product with ID ${productId}:`, error);
    return null;
  }
  return data as Product | null;
}


export async function getCategories(): Promise<string[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true); // Assuming categories should only be from active products

  if (error) {
    console.error('Supabase error fetching categories:', error);
    throw new Error(`Não foi possível carregar as categorias. Erro do Supabase: "${error.message}". Verifique os logs do servidor e as políticas RLS.`);
  }

  if (!data) {
    return [];
  }

  const uniqueCategories = [...new Set(data.map((item: { category: string }) => item.category))];
  return uniqueCategories.sort();
}

export async function searchProductsByName(query: string): Promise<Product[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  if (!query || query.trim() === "") {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, image, category, is_active, created_at') // Added is_active and created_at for consistency
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Supabase search error:', error);
    return []; 
  }
  return data as Product[] || [];
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error getting user in deleteProduct server action:', authError);
    return { success: false, message: `Erro de autenticação ao excluir: ${authError.message}` };
  }

  if (!user) {
    console.warn('No user found in deleteProduct server action (no authError).');
    return { success: false, message: "Ação não autorizada. Usuário não autenticado." };
  }

  if (!productId) {
    return { success: false, message: "ID do produto não fornecido." };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Supabase error deleting product:', error);
    return { success: false, message: `Erro ao excluir produto: ${error.message}. Verifique os logs do servidor e as políticas RLS.` };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  return { success: true, message: "Produto excluído com sucesso." };
}

export async function updateProduct(productId: string, productData: ProductUpdateData): Promise<{ success: boolean; message?: string; product?: Product }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error getting user in updateProduct server action:', authError);
    return { success: false, message: `Erro de autenticação ao atualizar: ${authError.message}` };
  }

  if (!user) {
    console.warn('No user found in updateProduct server action (no authError).');
    return { success: false, message: "Ação não autorizada. Usuário não autenticado." };
  }

  if (!productId) {
    return { success: false, message: "ID do produto não fornecido." };
  }

  const updateData = Object.fromEntries(
    Object.entries(productData).filter(([_, v]) => v !== undefined)
  );
  
  if (Object.keys(updateData).length === 0) {
     return { success: false, message: "Nenhum dado fornecido para atualização." };
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select('id, name, description, image, category, is_active, created_at')
    .single();

  if (error) {
    console.error('Supabase error updating product:', error);
    return { success: false, message: `Erro ao atualizar produto: ${error.message}. Verifique os logs do servidor e as políticas RLS.` };
  }

  revalidatePath('/admin/produtos');
  revalidatePath(`/admin/produtos/edit/${productId}`);
  revalidatePath('/'); 

  return { success: true, message: "Produto atualizado com sucesso.", product: data as Product };
}
