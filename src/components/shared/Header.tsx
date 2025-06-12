
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

export function Header() {
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

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 py-3 px-4 sm:px-6 lg:px-8 bg-background/70 dark:bg-background/50 backdrop-blur-lg border-b border-white/20 dark:border-white/10 shadow-sm"
    >
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2" aria-label="Vidro Showcase Home">
          <Gem className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-bold text-foreground">Vidro Showcase</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => scrollToSection(item.id)}
              className="text-foreground hover:text-accent-foreground transition-colors"
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center">
          <ThemeToggle />
          {/* Mobile menu button can be added here */}
        </div>
      </div>
    </motion.header>
  );
}
