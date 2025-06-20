
"use client";

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { CartSheet } from './CartSheet';

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <CartSheet>
      <Button variant="ghost" size="icon" className="relative" aria-label="Abrir carrinho de compras">
        <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
        {itemCount > 0 && (
          <Badge
            variant="destructive" // Or use 'default' with primary color for a different look
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground shadow-md border border-background"
          >
            {itemCount}
          </Badge>
        )}
        <span className="sr-only">Carrinho de Compras</span>
      </Button>
    </CartSheet>
  );
}
