"use client";

import Image from 'next/image';
import { m } from 'framer-motion';
import type { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Using Card for structure

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      <CardHeader className="p-0 relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={800}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1 text-foreground">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
          {product.category}
        </Badge>
      </CardFooter>
    </m.div>
  );
}
