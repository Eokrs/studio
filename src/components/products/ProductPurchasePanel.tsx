
'use client';

import type { Product } from '@/data/products';
import type { Addon } from '@/types/cart';
import { useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCartIcon, TagIcon, Minus, Plus, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const SIZES = ["37", "38", "39", "40", "41", "42", "43", "44"];
const AVAILABLE_ADDONS: Addon[] = [
  { name: 'Caixa Original', price: 50 },
  { name: 'QC Photos (Fotos de Controle)', price: 15 },
  { name: 'Medidas da Palmilha', price: 10 },
  { name: 'Socks (Meias)', price: 25 },
  { name: 'Shoe Tree (Moldador)', price: 30 },
];

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.some(a => a.name === addon.name);
      if (isSelected) {
        return prev.filter(a => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const totalPrice = useMemo(() => {
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    return (product.price + addonsPrice) * quantity;
  }, [product.price, selectedAddons, quantity]);

  const formattedBasePrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
  const formattedTotalPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: "Tamanho Necessário", description: "Por favor, selecione um tamanho." });
      return;
    }
    if (quantity < 1) {
       toast({ title: "Quantidade Inválida", description: "A quantidade deve ser de pelo menos 1.", variant: "destructive" });
      return;
    }
    addToCart(product, selectedSize, quantity, selectedAddons);
  };

  return (
    <ScrollReveal className="flex flex-col gap-4">
      <Badge variant="outline" className="w-fit text-sm py-1 px-3 border-primary/50 text-primary bg-primary/10">
        <TagIcon className="inline-block h-4 w-4 mr-2" />
        {product.category}
      </Badge>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
      <p className="text-2xl md:text-3xl font-semibold text-foreground">
        {formattedBasePrice}
      </p>
      <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
      
      <Separator className="my-2" />

      {/* Tamanhos */}
      <div className="w-full pt-2">
        <p className="text-sm font-medium text-foreground mb-2">Selecione o Tamanho:</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Button key={size} variant="outline" size="lg" onClick={() => setSelectedSize(size)}
              className={`h-11 px-5 rounded-lg transition-all ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary/50' : 'bg-transparent'}`}>
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Opcionais */}
      <div className="w-full pt-2">
        <p className="text-sm font-medium text-foreground mb-2">Adicionais (Opcional):</p>
        <div className="flex flex-col gap-2">
          {AVAILABLE_ADDONS.map((addon) => (
            <Button key={addon.name} variant="outline" onClick={() => handleToggleAddon(addon)}
              className={`justify-start gap-3 transition-all ${selectedAddons.some(a => a.name === addon.name) ? 'bg-green-100 dark:bg-green-900/40 border-green-500/50 text-green-800 dark:text-green-300' : ''}`}>
              <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selectedAddons.some(a => a.name === addon.name) ? 'bg-green-500 border-green-600' : 'border-muted-foreground'}`}>
                {selectedAddons.some(a => a.name === addon.name) && <Check className="h-3 w-3 text-white" />}
              </div>
              <span>{addon.name}</span>
              <span className="ml-auto font-mono text-xs">+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-2" />
      
      {/* Quantidade e Total */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Quantidade:</p>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="h-9 w-16 text-center" />
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="text-right">
              <p className="text-sm text-muted-foreground">Preço Total</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formattedTotalPrice}</p>
          </div>
      </div>

      {/* Botão de Adicionar */}
      <Button onClick={handleAddToCart} size="lg" className="w-full text-lg py-7 mt-4 bg-green-600 hover:bg-green-700 text-white group shadow-lg transition-all duration-300 transform hover:scale-105">
        <ShoppingCartIcon className="mr-3 h-6 w-6" />
        Adicionar ao Carrinho
      </Button>

      {/* Processo de Compra */}
       <div className="mt-4 text-center text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-1 text-foreground/80">Como funciona após o pedido:</h4>
          <p>1. Realize o pedido e o pagamento via WhatsApp.</p>
          <p>2. Aguarde o envio para QC (Controle de Qualidade) e pesagem (1-3 dias úteis).</p>
      </div>
    </ScrollReveal>
  );
}
