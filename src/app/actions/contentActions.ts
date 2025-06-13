
'use server';
/**
 * @fileOverview Server actions for fetching general page content.
 *
 * - AboutContent - Type for about section content.
 * - getAboutContent - Fetches content for the About Us section.
 */

export interface AboutContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  imageUrl: string;
  imageAlt: string;
}

// Mock data for About Section, simulating a database record
const aboutData: AboutContent = {
  title: "Sobre Nossa Marca",
  paragraph1: "Na Nuvyra Store, acreditamos que a excelência está nos detalhes. Nossa missão é apresentar produtos que combinam design sofisticado, funcionalidade inteligente e uma estética moderna.",
  paragraph2: "Cada item em nossa vitrine é cuidadosamente selecionado para inspirar e elevar sua experiência diária, refletindo as últimas tendências e inovações.",
  paragraph3: "Explore um universo onde a forma encontra a função, e a beleza se manifesta em cada peça.",
  imageUrl: "https://placehold.co/600x600.png",
  imageAlt: "Sobre Nuvyra Store",
};


export async function getAboutContent(): Promise<AboutContent> {
  // In a real scenario, this would fetch from a database
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
  return aboutData;
}

