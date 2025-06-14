
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  is_active?: boolean; // Adicionado para poder ser editado e exibido
  created_at?: string; // Mantido opcional, geralmente gerenciado pelo DB
}

// Mock data is no longer needed as it will come from Supabase.
// The 'categories' array is now dynamically fetched by getCategories action.
// The 'products' array is now dynamically fetched by getProducts action.

// export const categories = ["Eletrônicos", "Decoração", "Vestuário", "Acessórios"];

// export const products: Product[] = [
//   {
//     id: "1",
//     name: "Smartphone Moderno X",
//     description: "Tecnologia de ponta com design elegante e display vibrante.",
//     image: "https://placehold.co/600x800.png",
//     category: "Eletrônicos",
//   },
//   // ... other mock products
// ];
