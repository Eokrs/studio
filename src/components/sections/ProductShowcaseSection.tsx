
"use client";

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import type { Product } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryFilters } from '@/components/products/CategoryFilters';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { getProducts, getCategories } from '@/app/actions/productActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

const PRODUCTS_PER_PAGE = 20;

export interface CategoryWithCount {
  name: string;
  count: number;
}

export function ProductShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productCategoriesWithCount, setProductCategoriesWithCount] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedProductsCount, setDisplayedProductsCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const [fetchedProducts, fetchedCategoriesWithCount] = await Promise.all([
          getProducts(), // Fetches all active products by default
          getCategories() // Fetches categories with their active product counts
        ]);
        
        // Filter products to only include those that are active (is_active: true)
        // getProducts already implies active, but double-checking or relying on its internal filter is key
        const activeProducts = fetchedProducts.filter(p => p.is_active !== false); // Assuming is_active is true if undefined
        setAllProducts(activeProducts);
        setProductCategoriesWithCount(fetchedCategoriesWithCount);

      } catch (err) {
        console.error("Failed to fetch product data:", err);
        let errorMessage = "Falha ao carregar os produtos. Por favor, tente novamente mais tarde.";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") {
      return allProducts;
    }
    return allProducts.filter(product => product.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  const productsToDisplay = useMemo(() => {
    return filteredProducts.slice(0, displayedProductsCount);
  }, [filteredProducts, displayedProductsCount]);

  const hasMoreProducts = useMemo(() => {
    return displayedProductsCount < filteredProducts.length;
  }, [displayedProductsCount, filteredProducts.length]);

  const handleLoadMore = () => {
    setDisplayedProductsCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
  };

  useEffect(() => {
    // Reset displayed count when category changes
    setDisplayedProductsCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <section id="produtos" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
              Nossa Vitrine
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Carregando produtos incríveis para você...
            </p>
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full bg-muted/50" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => ( 
              <div key={index} className="glass-card overflow-hidden h-full flex flex-col p-1.5">
                <Skeleton className="aspect-square w-full rounded-md bg-muted/50" />
                <div className="p-3 flex-grow">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-muted/50" />
                  <Skeleton className="h-3 w-full mb-2 bg-muted/50" />
                  <Skeleton className="h-3 w-2/3 mb-2 bg-muted/50" />
                </div>
                <div className="p-3 pt-0">
                   <Skeleton className="h-8 w-full rounded-md bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="produtos" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
           <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-destructive">
              Ocorreu um Erro
            </h2>
          <div className="flex flex-col items-center justify-center bg-destructive/10 p-8 rounded-lg max-w-2xl mx-auto">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-lg text-destructive-foreground bg-destructive p-4 rounded-md">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Nossa Vitrine
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Explore nossa coleção de produtos cuidadosamente selecionados para você.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <CategoryFilters
            categoriesWithCount={productCategoriesWithCount}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalActiveProducts={allProducts.length}
          />
        </ScrollReveal>
        
        <m.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
        >
          <AnimatePresence>
            {productsToDisplay.map((product, index) => (
               <ScrollReveal key={product.id + '-' + index} delay={index < PRODUCTS_PER_PAGE ? index * 0.05 : 0}>
                 <ProductCard product={product} />
               </ScrollReveal>
            ))}
          </AnimatePresence>
        </m.div>

        {filteredProducts.length === 0 && !isLoading && (
          <m.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-12 text-lg"
          >
            Nenhum produto encontrado para esta categoria.
          </m.p>
        )}

        {hasMoreProducts && (
          <ScrollReveal className="text-center mt-12">
            <Button
              onClick={handleLoadMore}
              size="lg"
              variant="outline"
              className="bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/60 dark:hover:bg-primary/40 hover:backdrop-blur-md hover:shadow-lg hover:border hover:border-primary/30 dark:hover:border-primary/20"
            >
              Carregar Mais Produtos
              <Loader2 className="ml-2 h-5 w-5 animate-spin hidden" /> 
            </Button>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

