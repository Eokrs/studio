
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
import type { Product } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryFilters } from '@/components/products/CategoryFilters';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { getProducts, getCategories } from '@/app/actions/productActions';
import { getSiteSettings } from '@/app/actions/settingsActions';
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
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const [fetchedProducts, fetchedCategoriesWithCount, fetchedSettings] = await Promise.all([
          getProducts(),
          getCategories(),
          getSiteSettings(),
        ]);
        
        const activeProducts = fetchedProducts.filter(p => p.is_active !== false);
        setAllProducts(activeProducts);
        setProductCategoriesWithCount(fetchedCategoriesWithCount);
        setBannerImages(fetchedSettings.bannerImages && fetchedSettings.bannerImages.length > 0 ? fetchedSettings.bannerImages : ['https://placehold.co/1200x400.png']);

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
  
  useEffect(() => {
    if (bannerImages.length > 1) {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
    }
  }, [bannerImages.length]);

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
    setDisplayedProductsCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <section id="produtos" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <Skeleton className="h-64 md:h-80 w-full mb-12 rounded-lg bg-muted/50" />
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
        {bannerImages.length > 0 && (
          <div className="relative w-full h-56 sm:h-64 md:h-80 mb-12 rounded-lg overflow-hidden shadow-lg group">
              <AnimatePresence initial={false}>
                  <m.div
                      key={currentSlide}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                      <Image
                          src={bannerImages[currentSlide]}
                          alt={`Banner image ${currentSlide + 1}`}
                          fill
                          className="object-contain"
                          priority={currentSlide === 0}
                      />
                  </m.div>
              </AnimatePresence>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {bannerImages.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                          aria-label={`Go to slide ${index + 1}`}
                      />
                  ))}
              </div>
          </div>
        )}

        <CategoryFilters
          categoriesWithCount={productCategoriesWithCount}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalActiveProducts={allProducts.length}
        />
        
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
              className="bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/80 hover:shadow-lg"
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
