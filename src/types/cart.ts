import type { Product } from '@/data/products';

export interface Addon {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${size}-${addonKey}`
  product: Product;
  quantity: number;
  size: string;
  addons: Addon[];
}
