
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Still needed for search results and now for logo
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search as SearchIcon } from 'lucide-react';
import { searchProductsByName } from '@/app/actions/productActions';
import type { Product } from '@/data/products';
import { CartButton } from '@/components/cart/CartButton'; // Import CartButton

export function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Produtos', id: 'produtos' },
    { label: 'Sobre', id: 'sobre' },
    // { label: 'Galeria', id: 'galeria' },
    { label: 'Contato', id: 'contato' },
  ];

  const fetchResults = useCallback(async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setIsPopoverOpen(false);
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);

    try {
      const results = await searchProductsByName(query);
      setSearchResults(results);
      setIsPopoverOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setIsPopoverOpen(true);
    }
    setIsSearchLoading(false);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setIsPopoverOpen(false);
      setIsSearchLoading(false);
      return;
    }

    const timerId = setTimeout(() => {
      fetchResults(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, fetchResults]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleResultClick = (product: Product) => {
    console.log('Selected product:', product.name);
    setSearchTerm('');
    setSearchResults([]);
    setIsPopoverOpen(false);
    // Future: navigate to product page or scroll to product in showcase
    // You might want to implement a way to focus or navigate to the product
    // For now, it just closes the popover.
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() || searchResults.length > 0 || isSearchLoading) {
      setIsPopoverOpen(true);
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 py-3 px-4 sm:px-6 lg:px-8 bg-background/70 dark:bg-background/50 backdrop-blur-lg border-b border-white/20 dark:border-white/10 shadow-sm"
    >
      <div className="container mx-auto flex items-center justify-between max-w-7xl gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Nuvyra Store Home">
          <Image
            src="https://i.imgur.com/4rYd4ps.png"
            alt="Nuvyra Store Logo"
            width={32}
            height={32}
            className="h-8 w-8" 
          />
          {/* <h1 className="text-xl font-headline font-bold text-foreground">Nuvyra Store</h1> */}
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => scrollToSection(item.id)}
              className="text-foreground px-3 py-2 rounded-md transition-all duration-300 hover:text-accent-foreground hover:bg-card/30 dark:hover:bg-card/20 hover:backdrop-blur-md hover:border hover:border-white/20 dark:hover:border-white/10 hover:shadow-lg"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-grow md:flex-grow-0 justify-end">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full max-w-xs md:max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  className="pl-9 pr-3 h-10 w-full rounded-md border bg-background/80 focus:bg-background"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleInputFocus}
                  aria-label="Buscar produtos"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-[300px] md:w-[350px] p-0 mt-1"
              align="end"
              sideOffset={5}
            >
              {isSearchLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto divide-y divide-border">
                  {searchResults.map((product) => (
                    <li key={product.id}>
                      <div
                        className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer"
                        onClick={() => handleResultClick(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleResultClick(product)}
                      >
                        <Image
                          src={product.image || 'https://placehold.co/40x40.png'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : searchTerm.trim() !== '' ? (
                <div className="p-4 text-sm text-muted-foreground">Nenhum resultado encontrado.</div>
              ) : null}
            </PopoverContent>
          </Popover>
          <CartButton /> {/* Add CartButton here */}
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
