import { HeroSection } from '@/components/sections/HeroSection';
import { ProductShowcaseSection } from '@/components/sections/ProductShowcaseSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { ContactSection } from '@/components/sections/ContactSection';
import { MotionLazyContainer } from '@/components/animations/MotionLazyContainer';


export default function HomePage() {
  return (
    <MotionLazyContainer>
      <HeroSection />
      <ProductShowcaseSection />
      <AboutSection />
      <GallerySection />
      <ContactSection />
    </MotionLazyContainer>
  );
}
