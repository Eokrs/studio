
"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Fundo abstrato moderno"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="z-0 opacity-40 dark:opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background z-0 backdrop-blur-sm"></div>
      
      <div className="relative z-10 p-6 container mx-auto">
        <ScrollReveal delay={0.2}>
          <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Nuvyra Store
            </span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.4}>
          <p className="text-xl md:text-2xl text-foreground/80 dark:text-foreground/70 mb-10 max-w-2xl mx-auto">
            Descubra uma seleção exclusiva de produtos com design inovador e qualidade excepcional.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.6}>
          <Button
            size="lg"
            onClick={scrollToProducts}
            className="group bg-primary text-primary-foreground rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-primary/60 dark:hover:bg-primary/40 hover:backdrop-blur-md hover:border hover:border-primary/30 dark:hover:border-primary/20"
            aria-label="Rolar para produtos"
          >
            Explorar Produtos
            <ArrowDown className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
