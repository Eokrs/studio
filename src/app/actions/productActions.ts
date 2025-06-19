
'use server';
/**
 * @fileOverview Server actions for fetching and managing product data from Supabase.
 *
 * - getProducts - Fetches products with optional pagination, ensuring they are active and valid.
 * - getProductById - Fetches a single product by its ID.
 * - getCategories - Fetches all unique active product categories with their counts, based on valid products.
 * - searchProductsByName - Fetches products matching a search query.
 * - deleteProduct - Deletes a product by its ID.
 * - updateProduct - Updates an existing product.
 */
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; 
import type { Database } from '@/lib/supabase';
import type { Product, ProductUpdateData } from '@/data/products';
import { revalidatePath } from 'next/cache';

// This log confirms the file is loaded by Next.js
console.log('PRODUCT ACTIONS FILE LOADED - Top Level Log');

// Helper function to get the Supabase auth cookie name, consistent with middleware attempt
const getSupabaseAuthCookieName = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('[productActions:getSupabaseAuthCookieName] NEXT_PUBLIC_SUPABASE_URL is not defined. Using generic cookie name.');
    return `sb-unknown-auth-token`;
  }
  try {
    const url = new URL(supabaseUrl); // Use URL constructor for robust parsing
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) {
      console.warn('[productActions:getSupabaseAuthCookieName] Could not derive projectRef from NEXT_PUBLIC_SUPABASE_URL. Using default pattern.');
      return `sb-unknown-auth-token`;
    }
    return `sb-${projectRef}-auth-token`;
  } catch (e) {
    console.error('[productActions:getSupabaseAuthCookieName] Error parsing Supabase URL:', e);
    return `sb-error-parsing-url-auth-token`;
  }
};


export async function getProducts(options?: { limit?: number; offset?: number }): Promise<Product[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from('products')
    .select('id, name, description, image, category, created_at, is_active')
    .eq('is_active', true)        // Ensure only active products are fetched
    .not('name', 'is', null)       // Ensure name is not null
    .filter('name', 'neq', '')     // Ensure name is not an empty string
    .not('image', 'is', null)      // Ensure image is not null
    .filter('image', 'neq', '')    // Ensure image is not an empty string
    .not('category', 'is', null)   // Ensure category is not null
    .filter('category', 'neq', '') // Ensure category is not an empty string
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


export async function getCategories(): Promise<Array<{ name: string; count: number }>> {
  const supabase = createServerActionClient<Database>({ cookies });
  
  // Fetch products that are active and have valid, non-empty categories, names, and images
  const { data: validProductsForCategories, error: productsError } = await supabase
    .from('products')
    .select('category, name, image') // Select fields needed for validation and counting
    .eq('is_active', true)
    .not('name', 'is', null)
    .filter('name', 'neq', '')
    .not('image', 'is', null)
    .filter('image', 'neq', '')
    .not('category', 'is', null)
    .filter('category', 'neq', '');

  if (productsError) {
    console.error('Supabase error fetching products for category count:', productsError);
    throw new Error(`Não foi possível carregar as categorias. Erro do Supabase: "${productsError.message}". Verifique os logs do servidor e as políticas RLS.`);
  }

  if (!validProductsForCategories) {
    return [];
  }

  // Count products per category, ensuring category is trimmed and valid
  const categoryCounts: Record<string, number> = {};
  for (const product of validProductsForCategories) {
    // product.category is guaranteed by the query to be non-null and non-empty.
    // product.name and product.image are also guaranteed to be non-null and non-empty.
    const cleanedCategory = product.category.trim();
    // No need to check if cleanedCategory is empty again, as query handles it.
    // if (cleanedCategory) { // This check becomes redundant if query is correct
      categoryCounts[cleanedCategory] = (categoryCounts[cleanedCategory] || 0) + 1;
    // }
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
    .select('id, name, description, image, category, is_active, created_at') 
    .ilike('name', `%${query}%`)
    .eq('is_active', true) // Ensure search results are also active and valid
    .not('name', 'is', null).filter('name', 'neq', '')
    .not('image', 'is', null).filter('image', 'neq', '')
    .not('category', 'is', null).filter('category', 'neq', '')
    .order('created_at', { ascending: false })
    .limit(10); // Increased limit slightly for better search UX

  if (error) {
    console.error('Supabase search error:', error);
    return [];
  }
  return data as Product[] || [];
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
  console.log(`--- [deleteProduct Action] --- STEP 1: Action Called for product ID: ${productId}`);
  
  if (!productId) {
    console.log("--- [deleteProduct Action] --- STEP ERROR: Product ID not provided.");
    return { success: false, message: "ID do produto não fornecido." };
  }

  let supabase;
  const authCookieName = getSupabaseAuthCookieName();
  const cookieStore = cookies(); 
  const specificAuthCookie = cookieStore.get(authCookieName); 
  let cookieDebugMessage = `Cookie '${authCookieName}' `;
  cookieDebugMessage += specificAuthCookie ? `ENCONTRADO (Valor Início: ${specificAuthCookie.value.substring(0,15)}...).` : `NÃO ENCONTRADO.`;
  
  console.log(`--- [deleteProduct Action] --- STEP 2: Cookie check. ${cookieDebugMessage}`);

  try {
    console.log(`--- [deleteProduct Action] --- STEP 3: Supabase client CREATION ATTEMPT.`);
    supabase = createServerActionClient<Database>({ cookies: cookieStore }); 
    console.log(`--- [deleteProduct Action] --- STEP 4: Supabase client created.`);
  } catch (clientError: any) {
    console.error('--- [deleteProduct Action] --- CRITICAL ERROR creating Supabase client:', clientError);
    return { success: false, message: `Erro crítico ao inicializar cliente Supabase: ${clientError.message}. ${cookieDebugMessage}` };
  }
  
  console.log("--- [deleteProduct Action] --- STEP 5: Attempting supabase.auth.getUser()");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('--- [deleteProduct Action] --- AUTH ERROR from supabase.auth.getUser():', authError);
    return { success: false, message: `Erro de autenticação ao deletar. ${cookieDebugMessage} Detalhe: ${authError.message}` };
  }

  if (!user) {
    console.warn('--- [deleteProduct Action] --- AUTH WARNING: No user object (but no authError). Potentially unauthorized.');
    return { success: false, message: `Ação não autorizada. ${cookieDebugMessage} (Usuário não autenticado - no user object): ${authError ? authError.message : 'Auth session missing!'}` };
  }
  
  console.log('--- [deleteProduct Action] --- AUTH SUCCESS: User ID:', user.id);
  console.log("--- [deleteProduct Action] --- STEP 6: Authentication passed. Deleting product from database...");
  
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (deleteError) {
    console.error('--- [deleteProduct Action] --- DB ERROR deleting product:', deleteError);
    return { success: false, message: `Erro ao deletar produto do banco de dados: ${deleteError.message}` };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  console.log("--- [deleteProduct Action] --- STEP 7: Product deleted successfully from database.");
  return { success: true, message: "Produto excluído com sucesso!" };
}

export async function updateProduct(productId: string, productData: ProductUpdateData): Promise<{ success: boolean; message?: string; product?: Product }> {
  console.log(`--- [updateProduct Action] --- STEP 1: Action Called for product ID: ${productId}`);
  console.log("--- [updateProduct Action] --- Product Data to update:", JSON.stringify(productData, null, 2));

  let supabase;
  const authCookieName = getSupabaseAuthCookieName();
  const cookieStore = cookies(); 
  const specificAuthCookie = cookieStore.get(authCookieName); 
  let cookieDebugMessage = `Cookie '${authCookieName}' `;
  cookieDebugMessage += specificAuthCookie ? `ENCONTRADO (Valor Início: ${specificAuthCookie.value.substring(0,15)}...).` : `NÃO ENCONTRADO.`;
  
  console.log(`--- [updateProduct Action] --- STEP 2: Cookie check. ${cookieDebugMessage}`);

  try {
    console.log(`--- [updateProduct Action] --- STEP 3: Supabase client CREATION ATTEMPT.`);
    supabase = createServerActionClient<Database>({ cookies: cookieStore }); 
    console.log(`--- [updateProduct Action] --- STEP 4: Supabase client created.`);
  } catch (clientError: any) {
    console.error('--- [updateProduct Action] --- CRITICAL ERROR creating Supabase client:', clientError);
    return { success: false, message: `Erro crítico ao inicializar cliente Supabase: ${clientError.message}. ${cookieDebugMessage}` };
  }

  console.log("--- [updateProduct Action] --- STEP 5: Attempting supabase.auth.getUser()");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('--- [updateProduct Action] --- AUTH ERROR from supabase.auth.getUser():', authError);
    return { success: false, message: `Erro de autenticação ao atualizar. ${cookieDebugMessage} Detalhe: ${authError.message}` };
  }

  if (!user) {
    console.warn('--- [updateProduct Action] --- AUTH WARNING: No user object (but no authError). Potentially unauthorized.');
    return { success: false, message: `Ação não autorizada. ${cookieDebugMessage} (Usuário não autenticado - no user object): ${authError ? authError.message : 'Auth session missing!'}` };
  }

  console.log('--- [updateProduct Action] --- AUTH SUCCESS: User ID:', user.id );
  console.log("--- [updateProduct Action] --- STEP 6: Authentication passed. Updating product in database...");
  
  const { data: updatedProductData, error: updateError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single();

  if (updateError) {
    console.error('--- [updateProduct Action] --- DB ERROR updating product:', updateError);
    return { success: false, message: `Erro ao atualizar produto no banco de dados: ${updateError.message}` };
  }
  
  if (!updatedProductData) {
    console.error('--- [updateProduct Action] --- DB ERROR: No data returned after product update.');
    return { success: false, message: 'Nenhum dado retornado após a atualização do produto.'};
  }

  revalidatePath('/admin/produtos');
  revalidatePath(`/admin/produtos/edit/${productId}`);
  revalidatePath('/'); 

  console.log("--- [updateProduct Action] --- STEP 7: Product updated successfully in database.");
  return { 
    success: true, 
    message: "Produto atualizado com sucesso!",
    product: updatedProductData as Product
  };
}

    