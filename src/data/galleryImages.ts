export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  dataAiHint: string;
}

export const galleryImages: GalleryImage[] = [
  { id: "g1", src: "https://placehold.co/800x600.png", alt: "Imagem da galeria 1", dataAiHint: "modern interior" },
  { id: "g2", src: "https://placehold.co/600x800.png", alt: "Imagem da galeria 2", dataAiHint: "product detail" },
  { id: "g3", src: "https://placehold.co/800x800.png", alt: "Imagem da galeria 3", dataAiHint: "abstract design" },
  { id: "g4", src: "https://placehold.co/700x500.png", alt: "Imagem da galeria 4", dataAiHint: "lifestyle shot" },
  { id: "g5", src: "https://placehold.co/500x700.png", alt: "Imagem da galeria 5", dataAiHint: "tech gadget" },
  { id: "g6", src: "https://placehold.co/800x700.png", alt: "Imagem da galeria 6", dataAiHint: "fashion accessory" },
];
