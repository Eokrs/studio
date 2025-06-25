"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CategoryWithCount } from '@/components/sections/ProductShowcaseSection';
// import { TagIcon } from 'lucide-react'; // Placeholder for future brand icons

interface CategoryFiltersProps {
  categoriesWithCount: CategoryWithCount[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalActiveProducts: number;
}

export function CategoryFilters({ 
  categoriesWithCount, 
  selectedCategory, 
  onSelectCategory,
  totalActiveProducts
}: CategoryFiltersProps) {

  const allCategoriesForDisplay: CategoryWithCount[] = [
    { name: "Todos", count: totalActiveProducts },
    ...categoriesWithCount
  ];

  return (
    <div className="mb-8 hide-scrollbar"> 
      <div className="flex overflow-x-auto scroll-snap-x-mandatory py-2 gap-2 md:gap-3 px-1 md:flex-wrap md:justify-center md:overflow-x-visible">
        {allCategoriesForDisplay.map((categoryItem) => (
          <Button
            key={categoryItem.name}
            variant="ghost"
            onClick={() => onSelectCategory(categoryItem.name)}
            className={cn(
              "flex-shrink-0 scroll-snap-align-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Glassmorphism base for unselected
              "bg-card/60 dark:bg-muted/30 backdrop-blur-sm border border-border/50 text-foreground/80 hover:bg-primary/20 hover:text-primary-foreground hover:shadow-lg",
              // Sticky "Todos" button on mobile
              categoryItem.name === "Todos" && "md:sticky md:left-0 md:z-10", // Sticky only on md+, for mobile it scrolls
              // Selected state
              selectedCategory === categoryItem.name && 
              "bg-primary/20 text-primary border-primary/70 ring-1 ring-primary/50 font-semibold shadow-lg backdrop-blur-md"
            )}
          >
            {/* Placeholder for brand icon: <TagIcon className="mr-2 h-4 w-4" /> */}
            {categoryItem.name}
            {/* Count removed as requested */}
          </Button>
        ))}
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
