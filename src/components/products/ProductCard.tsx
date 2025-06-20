
"use client";

import Image from 'next/image';
import { m } from 'framer-motion';
import type { Product } from '@/data/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, TagIcon } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const SIZES = ["37", "38", "39", "40", "41", "42", "43"];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
    setSelectedSize(null); 
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="glass-card glass-interactive overflow-hidden h-full flex flex-col"
    >
      <CardHeader className="p-0 relative aspect-square w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="shoe fashion" 
        />
        <span className="absolute top-3 left-3 z-10 flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-card/70 dark:bg-card/50 backdrop-blur-sm text-foreground/90 shadow-lg border border-white/20 dark:border-white/10">
          <TagIcon className="inline-block h-3.5 w-3.5 mr-1.5 text-primary" />
          {product.category}
        </span>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 text-foreground">{product.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</CardDescription>
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-500 mt-2 mb-1">
          {formattedPrice}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-2 flex flex-col items-start w-full space-y-3 mt-auto">
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-1.5">Tamanho:</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SIZES.map((size) => (
              <Button
                key={size}
                variant="outline"
                size="sm"
                onClick={() => setSelectedSize(size)}
                className={`h-8 px-3 text-xs rounded-md transition-all duration-200
                            border border-white/20 dark:border-white/10
                            hover:bg-white/30 dark:hover:bg-white/15
                            focus-visible:ring-1 focus-visible:ring-ring 
                            ${selectedSize === size 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/80 dark:hover:bg-primary/70 border-primary/50' 
                              : 'bg-white/10 dark:bg-black/10 text-foreground/80 hover:text-foreground'
                            }`}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full text-foreground/90 font-medium rounded-md transition-all duration-300 shadow-md 
                     border border-primary/30 dark:border-primary/20 
                     bg-primary/10 hover:bg-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10 
                     backdrop-blur-sm hover:shadow-lg"
          aria-label={`Adicionar ${product.name} ao carrinho`}
        >
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </m.div>
  );
}
