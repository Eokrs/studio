
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number; // Added price
  is_active?: boolean;
  created_at?: string;
}
