
"use client";

import Image from 'next/image';
import type { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItemDisplayProps {
  item: CartItem;
}

export function CartItemDisplay({ item }: CartItemDisplayProps) {
  const { updateQuantity } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleRemoveFromCart = () => {
    updateQuantity(item.id, 0);
    toast({
      title: "Produto Removido",
      description: `${item.product.name} (Tam: ${item.size}) foi removido do carrinho.`,
      variant: "destructive",
    });
  };

  const itemBasePrice = item.product.price;
  const addonsPrice = item.addons.reduce((total, addon) => total + addon.price, 0);
  const totalItemPrice = itemBasePrice + addonsPrice;

  const itemSubtotalFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalItemPrice * item.quantity);

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/50">
      <Image
        src={item.product.image || 'https://placehold.co/64x64.png'}
        alt={item.product.name}
        width={64}
        height={64}
        className="rounded-md object-cover aspect-square"
      />
      <div className="flex-grow space-y-1.5">
        <h4 className="font-medium text-sm text-foreground leading-tight">{item.product.name}</h4>
        <p className="text-xs text-muted-foreground">
          Tam: {item.size}
        </p>
        {item.addons.length > 0 && (
            <div className="text-xs text-muted-foreground">
                <span className="font-medium">Adicionais:</span>
                <ul className="list-disc list-inside pl-1">
                    {item.addons.map(addon => (
                        <li key={addon.name}>{addon.name}</li>
                    ))}
                </ul>
            </div>
        )}
        <p className="text-sm font-medium text-foreground">
          Subtotal: {itemSubtotalFormatted}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={handleDecrement} className="h-7 w-7">
            -
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={handleQuantityChange}
            min="1"
            className="h-7 w-10 text-center px-1 bg-background/80 focus:bg-background text-sm"
            aria-label={`Quantidade de ${item.product.name} (Tam: ${item.size})`}
          />
          <Button variant="outline" size="icon" onClick={handleIncrement} className="h-7 w-7">
            +
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveFromCart}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7"
          aria-label={`Remover ${item.product.name} (Tam: ${item.size}) do carrinho`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
