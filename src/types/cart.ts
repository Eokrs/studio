
import type { Product } from '@/data/products';

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${size}`
  product: Product;
  quantity: number;
  size: string; // Shoe size
}
