import type { Product } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProductsSection({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-secondary/30 dark:bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
          Você pode gostar de...
        </h2>
        {/* Using a responsive grid instead of a carousel for simplicity and consistency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
