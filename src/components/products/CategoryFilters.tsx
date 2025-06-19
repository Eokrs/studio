
"use client";

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
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant="ghost" // Base variant, custom styling applied via cn
          onClick={() => onSelectCategory(category)}
          className={cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-sm", // Base pill structure
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", // Standard focus styling
            selectedCategory === category
              ? "bg-primary/20 text-primary border border-primary/70 ring-1 ring-primary/50 font-semibold backdrop-blur-sm shadow-md" // Selected state
              : "text-muted-foreground bg-background/60 dark:bg-muted/40 backdrop-blur-sm border border-border hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/60 hover:shadow-lg" // Unselected state
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
