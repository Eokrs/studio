"use client";

import Image from 'next/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function AboutSection() {
  return (
    <section id="sobre" className="py-16 lg:py-24 bg-secondary/30 dark:bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal className="md:order-2">
            <div className="relative aspect-square max-w-md mx-auto glass-card p-2">
              <Image
                src="https://placehold.co/600x600.png"
                alt="Sobre Vidro Showcase"
                width={600}
                height={600}
                className="rounded-lg object-cover"
                data-ai-hint="modern office"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal className="md:order-1">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Sobre Nossa Marca
            </h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Na Vidro Showcase, acreditamos que a excelência está nos detalhes. Nossa missão é apresentar produtos que combinam design sofisticado, funcionalidade inteligente e uma estética moderna.
            </p>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Cada item em nossa vitrine é cuidadosamente selecionado para inspirar e elevar sua experiência diária, refletindo as últimas tendências e inovações.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore um universo onde a forma encontra a função, e a beleza se manifesta em cada peça.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
