
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import type { Product } from '@/data/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TagIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <Link href={`/produto/${product.id}`} passHref>
      <m.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass-card glass-interactive overflow-hidden h-full flex flex-col cursor-pointer"
      >
        <CardHeader className="p-0 relative aspect-square w-full overflow-hidden group">
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
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg mb-1 text-foreground">{product.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex items-center justify-between w-full mt-auto">
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">
            {formattedPrice}
          </p>
        </CardFooter>
      </m.div>
    </Link>
  );
}
