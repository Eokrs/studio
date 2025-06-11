"use client";

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { products, categories as productCategories } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryFilters } from '@/components/products/CategoryFilters';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function ProductShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  }, [selectedCategory]);

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
            categories={productCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </ScrollReveal>
        
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
               <ScrollReveal key={product.id} delay={index * 0.1}>
                 <ProductCard product={product} />
               </ScrollReveal>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-12 text-lg"
          >
            Nenhum produto encontrado para esta categoria.
          </motion.p>
        )}
      </div>
    </section>
  );
}
