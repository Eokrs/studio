export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export const galleryImages: GalleryImage[] = [
  { id: "g1", src: "https://placehold.co/800x600.png", alt: "Imagem da galeria 1" },
  { id: "g2", src: "https://placehold.co/600x800.png", alt: "Imagem da galeria 2" },
  { id: "g3", src: "https://placehold.co/800x800.png", alt: "Imagem da galeria 3" },
  { id: "g4", src: "https://placehold.co/700x500.png", alt: "Imagem da galeria 4" },
  { id: "g5", src: "https://placehold.co/500x700.png", alt: "Imagem da galeria 5" },
  { id: "g6", src: "https://placehold.co/800x700.png", alt: "Imagem da galeria 6" },
];
