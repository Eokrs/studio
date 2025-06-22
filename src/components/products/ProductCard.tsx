
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import type { Product } from '@/data/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

// Helper to get category-specific colors
const getCategoryStyle = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('jordan')) {
        return 'bg-red-900/70 text-red-300 border-red-500/30';
    }
    if (lowerCategory.includes('dunk')) {
        return 'bg-sky-900/70 text-sky-300 border-sky-500/30';
    }
    if (lowerCategory.includes('new balance')) {
        return 'bg-gray-700/70 text-gray-300 border-gray-500/30';
    }
    return 'bg-primary/20 text-primary-foreground/80 border-primary/30';
};


export function ProductCard({ product }: ProductCardProps) {
  const hasValidPrice = product.price && product.price > 0;
  
  const formattedPrice = hasValidPrice 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(product.price)
    : 'Preço sob consulta';

  return (
    <Link href={`/produto/${product.id}`} passHref>
      <m.div
        layout
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden h-full flex flex-col cursor-pointer border border-transparent hover:border-cyan-400/50 transition-all duration-300 ease-in-out shadow-lg"
      >
        <CardHeader className="p-0 relative aspect-square w-full overflow-hidden group">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            data-ai-hint="shoe fashion"
            loading="lazy"
          />
          {product.category && (
            <span className={cn(
                "absolute top-3 left-3 z-10 flex items-center px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-md border",
                getCategoryStyle(product.category)
            )}>
              <TagIcon className="inline-block h-3.5 w-3.5 mr-1.5" />
              {product.category}
            </span>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-semibold text-sm sm:text-base mb-1 text-foreground line-clamp-2">{product.name}</CardTitle>
          {/* A descrição pode ser re-adicionada aqui se necessário */}
        </CardContent>
        <CardFooter className="p-4 pt-2 mt-auto">
            <p className={cn(
                "text-lg font-bold",
                hasValidPrice ? "text-green-400" : "text-gray-400 text-base"
            )}>
            {formattedPrice}
          </p>
        </CardFooter>
      </m.div>
    </Link>
  );
}
