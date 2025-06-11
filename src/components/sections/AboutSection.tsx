
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { getAboutContent, type AboutContent } from '@/app/actions/contentActions';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export function AboutSection() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedContent = await getAboutContent();
        setContent(fetchedContent);
      } catch (err) {
        console.error("Failed to fetch about content:", err);
        setError("Falha ao carregar o conteúdo desta seção. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section id="sobre" className="py-16 lg:py-24 bg-secondary/30 dark:bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal className="md:order-2">
              <div className="relative aspect-square max-w-md mx-auto glass-card p-2">
                <Skeleton className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-lg bg-muted/50" />
              </div>
            </ScrollReveal>
            <ScrollReveal className="md:order-1">
              <Skeleton className="h-12 w-3/4 mb-6 bg-muted/50" />
              <Skeleton className="h-5 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-5 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-5 w-5/6 mb-4 bg-muted/50" />
              <Skeleton className="h-5 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-5 w-4/6 bg-muted/50" />
            </ScrollReveal>
          </div>
        </div>
      </section>
    );
  }

  if (error || !content) {
    return (
      <section id="sobre" className="py-16 lg:py-24 bg-secondary/30 dark:bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-destructive">
            Ocorreu um Erro
          </h2>
          <div className="flex flex-col items-center justify-center bg-destructive/10 p-8 rounded-lg">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-lg text-destructive">
              {error || "Não foi possível carregar o conteúdo desta seção."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="sobre" className="py-16 lg:py-24 bg-secondary/30 dark:bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal className="md:order-2">
            <div className="relative aspect-square max-w-md mx-auto glass-card p-2">
              <Image
                src={content.imageUrl}
                alt={content.imageAlt}
                width={600}
                height={600}
                className="rounded-lg object-cover"
                data-ai-hint={content.imageAiHint}
              />
            </div>
          </ScrollReveal>
          <ScrollReveal className="md:order-1">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              {content.paragraph1}
            </p>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              {content.paragraph2}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.paragraph3}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
