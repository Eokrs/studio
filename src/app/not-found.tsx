
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4 py-16">
      {/* 160px is an approximation for header + footer height */}
      <AlertTriangle className="w-24 h-24 text-destructive mb-8" />
      <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-6">
        Página Não Encontrada
      </h2>
      <p className="text-md md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
        Oops! Parece que a página que você está tentando acessar não existe, foi removida ou está temporariamente indisponível.
      </p>
      <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80">
        <Link href="/">
          <Home className="mr-2 h-5 w-5" />
          Voltar para a Página Inicial
        </Link>
      </Button>
    </div>
  );
}
