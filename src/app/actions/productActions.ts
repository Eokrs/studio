
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
import { cookies } from 'next/headers'; // Import the cookies function
import type { Database } from '@/lib/supabase';
import type { Product, ProductUpdateData } from '@/data/products';
import { revalidatePath } from 'next/cache';

// This log confirms the file is loaded by Next.js
console.log('PRODUCT ACTIONS FILE LOADED - Top Level Log');

// Helper function to get the Supabase auth cookie name
const getSupabaseAuthCookieName = () => {
  // This specific cookie name is based on previous logs from the user.
  // It should match 'sb-<project-ref>-auth-token'
  return 'sb-drxttdahrbbhndcbnmzq-auth-token';
};

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
    .eq('is_active', true); 

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
    .select('id, name, description, image, category, is_active, created_at') 
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
  console.log(`--- [deleteProduct Action] --- STEP 1: Action Called ---`);
  console.log(`Product ID for delete: ${productId}`);
  
  if (!productId) {
    console.log("--- [deleteProduct Action] --- STEP ERROR: Product ID not provided.");
    return { success: false, message: "ID do produto não fornecido." };
  }

  let supabase;
  try {
    supabase = createServerActionClient<Database>({ cookies }); // Pass the cookies function directly
    console.log(`--- [deleteProduct Action] --- STEP 2: Supabase client created ---`);
  } catch (clientError: any) {
    console.error('--- [deleteProduct Action] --- CRITICAL ERROR: Failed to create Supabase client:', clientError.message, clientError.stack);
    return { success: false, message: `Erro crítico ao inicializar cliente Supabase para deletar: ${clientError.message}` };
  }
  
  const cookieStoreForLogging = cookies();
  const authCookieName = getSupabaseAuthCookieName();
  const specificAuthCookie = cookieStoreForLogging.get(authCookieName);
  const cookieDebugMessage = specificAuthCookie ? `Cookie '${authCookieName}' ENCONTRADO.` : `Cookie '${authCookieName}' NÃO ENCONTRADO.`;
  console.log(`--- [deleteProduct Action] --- STEP 3: Cookie check: ${cookieDebugMessage}`);
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log(`--- [deleteProduct Action] --- STEP 4: supabase.auth.getUser() CALLED ---`);

  if (authError) {
    console.error('--- [deleteProduct Action] --- AUTH ERROR from supabase.auth.getUser():', JSON.stringify(authError, null, 2));
    return { success: false, message: `Erro de autenticação ao deletar. ${cookieDebugMessage} Detalhe: ${authError.message}` };
  }

  if (!user) {
    console.warn('--- [deleteProduct Action] --- AUTH WARNING: No user object returned (but no authError).');
    return { success: false, message: `Ação não autorizada. Usuário não autenticado para deletar (no user object). ${cookieDebugMessage}` };
  }
  
  console.log('--- [deleteProduct Action] --- AUTH SUCCESS: User object retrieved:', JSON.stringify(user, null, 2));
  console.log("--- [deleteProduct Action] --- STEP 5: Authentication seems to have passed. Deleting product...");
  
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (deleteError) {
    console.error('--- [deleteProduct Action] --- DB ERROR: Supabase error deleting product:', deleteError);
    return { success: false, message: `Erro ao deletar produto: ${deleteError.message}` };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  console.log("--- [deleteProduct Action] --- STEP 6: Product deleted successfully.");
  return { success: true, message: "Produto excluído com sucesso!" };
}

export async function updateProduct(productId: string, productData: ProductUpdateData): Promise<{ success: boolean; message?: string; product?: Product }> {
  console.log(`--- [updateProduct Action] --- STEP 1: Action Called ---`);
  console.log(`Product ID: ${productId}`);
  console.log("Product Data:", JSON.stringify(productData, null, 2));

  let supabase;
  try {
    // IMPORTANT: Pass the cookies FUNCTION from next/headers
    supabase = createServerActionClient<Database>({ cookies });
    console.log(`--- [updateProduct Action] --- STEP 2: Supabase client created ---`);
  } catch (clientError: any) {
    console.error('--- [updateProduct Action] --- CRITICAL ERROR: Failed to create Supabase client:', clientError.message, clientError.stack);
    return { success: false, message: `Erro crítico ao inicializar cliente Supabase: ${clientError.message}` };
  }

  const cookieStore = cookies();
  const authCookieName = getSupabaseAuthCookieName();
  const specificAuthCookie = cookieStore.get(authCookieName);
  const cookieDebugMessage = specificAuthCookie ? `Cookie '${authCookieName}' ENCONTRADO (valor: ${specificAuthCookie.value.substring(0,15)}...).` : `Cookie '${authCookieName}' NÃO ENCONTRADO.`;
  console.log(`--- [updateProduct Action] --- STEP 3: Cookie check: ${cookieDebugMessage}`);


  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log(`--- [updateProduct Action] --- STEP 4: supabase.auth.getUser() CALLED ---`);

  if (authError) {
    console.error('--- [updateProduct Action] --- AUTH ERROR from supabase.auth.getUser():', JSON.stringify(authError, null, 2));
    return { success: false, message: `Erro de autenticação. ${cookieDebugMessage} Detalhe: ${authError.message}` };
  }

  if (!user) {
    console.warn('--- [updateProduct Action] --- AUTH WARNING: No user object returned from supabase.auth.getUser() (but no authError).');
    return { success: false, message: `Ação não autorizada (sem objeto usuário). ${cookieDebugMessage}` };
  }

  console.log('--- [updateProduct Action] --- AUTH SUCCESS: User object retrieved:', JSON.stringify(user, null, 2));
  console.log("--- [updateProduct Action] --- STEP 5: Authentication passed. Updating product in database...");
  
  const { data: updatedProductData, error: updateError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single();

  if (updateError) {
    console.error('--- [updateProduct Action] --- DB ERROR: Supabase error updating product:', updateError);
    return { success: false, message: `Erro ao atualizar produto no banco de dados: ${updateError.message}` };
  }
  
  if (!updatedProductData) {
    console.error('--- [updateProduct Action] --- DB ERROR: No data returned after product update.');
    return { success: false, message: 'Nenhum dado retornado após a atualização do produto.'};
  }

  revalidatePath('/admin/produtos');
  revalidatePath(`/admin/produtos/edit/${productId}`);
  revalidatePath('/'); 

  console.log("--- [updateProduct Action] --- STEP 6: Product updated successfully in database.");
  return { 
    success: true, 
    message: "Produto atualizado com sucesso!",
    product: updatedProductData as Product
  };
}
    
