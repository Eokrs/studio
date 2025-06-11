export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  dataAiHint: string;
}

export const categories = ["Eletrônicos", "Decoração", "Vestuário", "Acessórios"];

export const products: Product[] = [
  {
    id: "1",
    name: "Smartphone Moderno X",
    description: "Tecnologia de ponta com design elegante e display vibrante.",
    image: "https://placehold.co/600x800.png",
    category: "Eletrônicos",
    dataAiHint: "smartphone modern",
  },
  {
    id: "2",
    name: "Luminária Abstrata",
    description: "Ilumine seu espaço com esta peça de design contemporâneo.",
    image: "https://placehold.co/600x700.png",
    category: "Decoração",
    dataAiHint: "abstract lamp",
  },
  {
    id: "3",
    name: "Jaqueta Urbana Tech",
    description: "Conforto e estilo para o dia a dia na cidade, com tecido inteligente.",
    image: "https://placehold.co/600x900.png",
    category: "Vestuário",
    dataAiHint: "urban jacket",
  },
  {
    id: "4",
    name: "Relógio Minimalista",
    description: "Elegância atemporal que complementa qualquer estilo.",
    image: "https://placehold.co/600x600.png",
    category: "Acessórios",
    dataAiHint: "minimalist watch",
  },
  {
    id: "5",
    name: "Fone de Ouvido Pro",
    description: "Qualidade de som imersiva e cancelamento de ruído superior.",
    image: "https://placehold.co/600x750.png",
    category: "Eletrônicos",
    dataAiHint: "pro headphones",
  },
  {
    id: "6",
    name: "Vaso Geométrico",
    description: "Adicione um toque de sofisticação moderna à sua casa.",
    image: "https://placehold.co/600x850.png",
    category: "Decoração",
    dataAiHint: "geometric vase",
  },
   {
    id: "7",
    name: "Tênis Esportivo Alpha",
    description: "Performance e design arrojado para suas atividades físicas.",
    image: "https://placehold.co/600x780.png",
    category: "Vestuário",
    dataAiHint: "sport sneakers",
  },
  {
    id: "8",
    name: "Mochila Inteligente",
    description: "Organização e tecnologia para sua rotina agitada.",
    image: "https://placehold.co/600x820.png",
    category: "Acessórios",
    dataAiHint: "smart backpack",
  },
];
