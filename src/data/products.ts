
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  is_active?: boolean;
  created_at?: string;
}
