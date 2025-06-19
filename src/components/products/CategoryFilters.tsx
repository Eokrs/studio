
"use client";

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          variant="ghost" // Use ghost variant to have a clean slate for custom styling
          onClick={() => onSelectCategory(category)}
          className={cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm", // Base structure: pill shape, padding, font
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none", // Standard focus styling
            selectedCategory === category
              ? "text-primary font-semibold" // Selected state: primary text color, animated underline handles the main visual
              : "text-muted-foreground bg-card/30 dark:bg-card/20 backdrop-blur-sm border border-card/50 dark:border-card/40 hover:bg-card/50 dark:hover:bg-card/30 hover:text-foreground hover:shadow-md" // Unselected state: glassmorphism style
          )}
        >
          {category}
          {selectedCategory === category && (
            <m.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="activeCategoryIndicator" // Ensures smooth animation between selected categories
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </Button>
      ))}
    </div>
  );
}
