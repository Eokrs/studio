"use client";

import { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { galleryImages, type GalleryImage } from '@/data/galleryImages';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XIcon, ZoomInIcon } from 'lucide-react';

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

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
          {galleryImages.map((img, index) => (
            <ScrollReveal key={img.id} delay={index * 0.1} className="group">
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
                      data-ai-hint={img.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomInIcon className="w-10 h-10 text-white" />
                    </div>
                  </m.div>
                </DialogTrigger>
                {/* DialogContent will be handled by the selectedImage state and a single Dialog outside the map if preferred, or one per trigger */}
              </Dialog>
            </ScrollReveal>
          ))}
        </div>

        <AnimatePresence>
          {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
              <DialogContent className="p-0 border-0 max-w-3xl w-full bg-transparent shadow-none">
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
                    data-ai-hint={selectedImage.dataAiHint}
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
