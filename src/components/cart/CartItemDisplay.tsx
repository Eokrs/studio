
"use client";

import Image from 'next/image';
import type { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface CartItemDisplayProps {
  item: CartItem;
}

export function CartItemDisplay({ item }: CartItemDisplayProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.id, newQuantity); // Use item.id (composite ID)
    }
  };

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1); // Use item.id
  };

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1); // Use item.id
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/50">
      <Image
        src={item.product.image || 'https://placehold.co/64x64.png'}
        alt={item.product.name}
        width={64}
        height={64}
        className="rounded-md object-cover aspect-square"
      />
      <div className="flex-grow">
        <h4 className="font-medium text-sm text-foreground">{item.product.name}</h4>
        <p className="text-xs text-muted-foreground">
          Tam: {item.size} &bull; {item.product.category}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDecrement} className="h-8 w-8">
          -
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          min="1"
          className="h-8 w-12 text-center px-1 bg-background/80 focus:bg-background"
          aria-label={`Quantidade de ${item.product.name} (Tam: ${item.size})`}
        />
        <Button variant="outline" size="icon" onClick={handleIncrement} className="h-8 w-8">
          +
        </Button>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => removeFromCart(item.id)} // Use item.id
        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-8"
        aria-label={`Remover ${item.product.name} (Tam: ${item.size}) do carrinho`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
