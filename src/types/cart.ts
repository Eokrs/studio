
import type { Product } from '@/data/products';

// Addons are no longer used.
// export interface Addon {
//   name: string;
//   price: number;
// }

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${size}`
  product: Product;
  quantity: number;
  size: string;
  // addons: Addon[]; // addons removed
}
