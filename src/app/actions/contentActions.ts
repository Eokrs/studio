'use server';
/**
 * @fileOverview Server actions for fetching general page content.
 *
 * - getAboutContent - Fetches content for the About Us section.
 */
import type { AboutContent } from '@/types/content'; // Updated import

// Mock data for About Section, simulating a database record
const aboutData: AboutContent = {
  title: "Sobre Nossa Marca",
  paragraph1: "Na Nuvyra Store, acreditamos que a excelência está nos detalhes. Nossa missão é apresentar produtos que combinam design sofisticado, funcionalidade inteligente e uma estética moderna.",
  paragraph2: "Cada item em nossa vitrine é cuidadosamente selecionado para inspirar e elevar sua experiência diária, refletindo as últimas tendências e inovações.",
  paragraph3: "Explore um universo onde a forma encontra a função, e a beleza se manifesta em cada peça.",
};


export async function getAboutContent(): Promise<AboutContent> {
  // 'use server'; // Removed from here
  // In a real scenario, this would fetch from a database
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
  return aboutData;
}
