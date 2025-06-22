
"use client";

import { useState, useMemo } from 'react';
import type { Product } from '@/data/products';
import type { Addon } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Check, Minus, Plus, ShoppingCartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SIZES = ["37", "38", "39", "40", "41", "42", "43", "44"];
const ADDONS: Addon[] = [
  { name: 'China Shipping Fee', price: 25.00 },
  { name: 'Remove Box', price: 0.00 },
  { name: 'QC Pictures', price: 15.00 },
  { name: 'Measurements', price: 10.00 },
  { name: 'Add Box', price: 30.00 },
  { name: 'Shoe Tree', price: 20.00 },
  { name: 'Socks', price: 12.00 },
];

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);

  const basePrice = product.price;
  const addonsPrice = useMemo(() => selectedAddons.reduce((total, addon) => total + addon.price, 0), [selectedAddons]);
  const totalPrice = useMemo(() => (basePrice + addonsPrice) * quantity, [basePrice, addonsPrice, quantity]);

  const formattedBasePrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basePrice);
  const formattedTotalPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice);

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.some(a => a.name === addon.name)
        ? prev.filter(a => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Tamanho Necessário",
        description: "Por favor, selecione um tamanho.",
        variant: "destructive",
      });
      return;
    }
    addToCart(product, selectedSize, quantity, selectedAddons);
    toast({
        title: "Produto Adicionado!",
        description: `${product.name} (x${quantity}) foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h1 className="text-3xl lg:text-4xl font-bold font-headline text-foreground">{product.name}</h1>
        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-500 mt-2">{formattedBasePrice}</p>
        {product.description && <p className="text-muted-foreground mt-4">{product.description}</p>}
      </div>

      <Separator />

      <div>
        <h3 className="text-md font-semibold mb-2">Tamanho (BR)</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}
              className="w-16"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Adicionais</h3>
        <div className="flex flex-wrap gap-2">
          {ADDONS.map(addon => (
            <Button
              key={addon.name}
              variant={selectedAddons.some(a => a.name === addon.name) ? "secondary" : "outline"}
              onClick={() => handleToggleAddon(addon)}
              className={`transition-all duration-200 ${selectedAddons.some(a => a.name === addon.name) ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500' : ''}`}
            >
              {selectedAddons.some(a => a.name === addon.name) && <Check className="mr-2 h-4 w-4" />}
              {addon.name} (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
          <Input type="number" value={quantity} readOnly className="w-12 h-8 text-center border-0 bg-transparent focus-visible:ring-0" />
          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex-grow text-center sm:text-right">
            <span className="text-sm text-muted-foreground">Preço Total: </span>
            <span className="text-2xl font-bold text-foreground">{formattedTotalPrice}</span>
        </div>
      </div>

      <Button onClick={handleAddToCart} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
        <ShoppingCartIcon className="mr-2 h-5 w-5" />
        Adicionar ao Carrinho
      </Button>

      <div className="text-center text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
          <p className="font-semibold">Processo de Compra:</p>
          <p>1. Realize o pedido e o pagamento via WhatsApp.</p>
          <p>2. Aguarde o envio das fotos de controle de qualidade (QC) e pesagem (1-3 dias úteis).</p>
      </div>
    </div>
  );
}
