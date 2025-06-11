
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import type { GalleryImage } from '@/data/galleryImages';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XIcon, ZoomInIcon, ImageOff, AlertTriangle } from 'lucide-react';
import { getGalleryImages } from '@/app/actions/galleryActions';
import { Skeleton } from '@/components/ui/skeleton';

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedImages = await getGalleryImages();
        setImages(fetchedImages);
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
        setError("Falha ao carregar as imagens da galeria. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchGalleryData();
  }, []);

  if (isLoading) {
    return (
      <section id="galeria" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
              Galeria Interativa
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Carregando visuais inspiradores...
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ScrollReveal key={index} delay={index * 0.1} className="group">
                 <div className="relative aspect-square rounded-lg overflow-hidden glass-card p-1.5">
                    <Skeleton className="w-full h-full rounded-md bg-muted/50" />
                 </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
     return (
      <section id="galeria" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
           <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-destructive">
              Erro ao Carregar Galeria
            </h2>
          <div className="flex flex-col items-center justify-center bg-destructive/10 p-8 rounded-lg">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-lg text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Galeria Interativa
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Inspire-se com visuais deslumbrantes e detalhes de nossos produtos em destaque.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img, index) => (
            <ScrollReveal key={img.id} delay={index * 0.05} className="group">
              <Dialog>
                <DialogTrigger asChild>
                  <m.div
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer glass-card p-1.5"
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={600}
                      height={600}
                      className="object-cover w-full h-full rounded-md transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomInIcon className="w-10 h-10 text-white" />
                    </div>
                  </m.div>
                </DialogTrigger>
              </Dialog>
            </ScrollReveal>
          ))}
        </div>
        
        {images.length === 0 && !isLoading && (
           <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-12 text-lg flex flex-col items-center"
          >
            <ImageOff className="w-12 h-12 text-muted-foreground mb-2" />
            Nenhuma imagem encontrada na galeria.
          </m.div>
        )}

        <AnimatePresence>
          {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
              <DialogContent className="p-0 border-0 max-w-3xl w-full bg-transparent shadow-none">
                <DialogTitle className="sr-only">{selectedImage.alt}</DialogTitle>
                <m.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    width={1200}
                    height={900}
                    className="rounded-lg object-contain max-h-[80vh] w-auto mx-auto"
                  />
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 rounded-full">
                      <XIcon className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </m.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
