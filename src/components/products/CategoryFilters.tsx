
"use client";

import { useState } from 'react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Using Button for consistency

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilters({ categories, selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  const allCategories = ["Todos", ...categories];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant="ghost"
          onClick={() => onSelectCategory(category)}
          className={`relative px-4 py-2 rounded-md transition-all duration-300 
                      ${selectedCategory === category 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/30 dark:hover:bg-card/20 hover:backdrop-blur-md hover:border hover:border-white/20 dark:hover:border-white/10 hover:shadow-lg'
                      }
                      focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
          {category}
          {selectedCategory === category && (
            <m.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="activeCategoryIndicator"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </Button>
      ))}
    </div>
  );
}
