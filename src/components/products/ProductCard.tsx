
"use client";

import Image from 'next/image';
import { m } from 'framer-motion';
import type { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext'; // Import useCart hook
import { ShoppingCartIcon } from 'lucide-react'; // For the new button

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart(); // Get addToCart function from context

  const whatsAppMessage = `Olá, gostaria de saber mais sobre o tênis ${product.name}.`;
  const whatsAppUrl = `https://wa.me/5522999586820?text=${encodeURIComponent(whatsAppMessage)}`;

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
        />
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 text-foreground">{product.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-3 pt-2 flex flex-col items-start w-full space-y-2"> {/* Added space-y-2 */}
        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30 text-xs">
          {product.category}
        </Badge>
        <Button
          onClick={() => addToCart(product)}
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
        <Button
          asChild
          className="w-full text-white font-semibold rounded-md transition-all duration-300 shadow-lg backdrop-blur-md border border-white/20 dark:border-white/10 bg-[#25D366]/[0.6] hover:bg-[#25D366]/[0.75] dark:bg-[#25D366]/[0.4] dark:hover:bg-[#25D366]/[0.55] hover:shadow-xl"
        >
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Adquirir o produto ${product.name} via WhatsApp`}
          >
            Adquirir Agora
          </a>
        </Button>
      </CardFooter>
    </m.div>
  );
}
