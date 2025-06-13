
"use client";

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Facebook, Instagram, Linkedin, Twitter, Send } from 'lucide-react';

export function ContactSection() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send data to an API)
    alert('Mensagem enviada! (Funcionalidade de exemplo)');
    (e.target as HTMLFormElement).reset();
  };

  const socialLinks = [
    { Icon: Facebook, href: "#", label: "Facebook" },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <section id="contato" className="py-16 lg:py-24 bg-secondary/30 dark:bg-secondary/20">
      <div className="container mx-auto px-4">
        <ScrollReveal className="max-w-3xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Entre em Contato
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Tem alguma dúvida ou sugestão? Adoraríamos ouvir você.
          </p>

          <form 
            onSubmit={handleSubmit} 
            className="glass-card p-6 md:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80">Nome</Label>
                <Input id="name" type="text" placeholder="Seu nome completo" required className="bg-background/80 focus:bg-background"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required className="bg-background/80 focus:bg-background"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground/80">Mensagem</Label>
              <Textarea id="message" placeholder="Sua mensagem..." rows={5} required  className="bg-background/80 focus:bg-background"/>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-primary text-primary-foreground group shadow-md transition-all duration-300 hover:bg-primary/60 dark:hover:bg-primary/40 hover:backdrop-blur-md hover:shadow-lg hover:border hover:border-primary/30 dark:hover:border-primary/20"
            >
              Enviar Mensagem
              <Send className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Ou nos encontre nas redes sociais:</p>
            <div className="flex justify-center space-x-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <m.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-2 rounded-full glass-card glass-interactive" // glass-interactive already has a glass hover
                >
                  <Icon className="w-6 h-6 text-foreground/80 hover:text-primary transition-colors" />
                </m.a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
