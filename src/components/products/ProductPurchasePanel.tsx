
'use client';

import type { Product } from '@/data/products';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCartIcon, TagIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const SIZES = ["37", "38", "39", "40", "41", "42", "43"];

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Tamanho Necessário",
        description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
        variant: "default",
      });
      return;
    }
    addToCart(product, selectedSize);
    toast({
      title: "Produto Adicionado!",
      description: `${product.name} (Tam: ${selectedSize}) foi adicionado ao seu carrinho.`,
    });
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <ScrollReveal className="flex flex-col gap-4">
      <Badge variant="outline" className="w-fit text-sm py-1 px-3 border-primary/50 text-primary bg-primary/10">
        <TagIcon className="inline-block h-4 w-4 mr-2" />
        {product.category}
      </Badge>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
      <p className="text-2xl md:text-3xl font-semibold text-emerald-600 dark:text-emerald-500">{formattedPrice}</p>
      <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
      
      <div className="w-full pt-4">
        <p className="text-sm font-medium text-foreground mb-2">Selecione o Tamanho:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant="outline"
              size="lg"
              onClick={() => setSelectedSize(size)}
              className={`h-12 px-5 text-base rounded-lg transition-all duration-200
                          border
                          hover:bg-white/30 dark:hover:bg-white/15
                          focus-visible:ring-1 focus-visible:ring-ring 
                          ${selectedSize === size 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 border-primary/50' 
                            : 'bg-transparent border-border text-foreground/80 hover:text-foreground hover:border-foreground/50'
                          }`}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleAddToCart}
        size="lg"
        className="w-full text-lg py-7 mt-4 bg-primary text-primary-foreground group shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-primary/80"
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        <ShoppingCartIcon className="mr-3 h-6 w-6" />
        Adicionar ao Carrinho
      </Button>
    </ScrollReveal>
  );
}
