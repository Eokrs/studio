
'use client'; // Componentes de erro DEVEM ser Componentes Cliente

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logar o erro para um serviço de reporte de erros
    console.error("GlobalError capturou:", error, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4 py-16 bg-background">
      <AlertTriangle className="w-20 h-20 text-destructive mb-8" />
      <h1 className="text-4xl font-bold text-destructive mb-4">
        Oops! Algo deu errado.
      </h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
        Lamentamos, mas encontramos um problema inesperado.
      </p>
      {error?.message && (
        <p className="text-sm text-destructive/80 bg-destructive/10 p-3 rounded-md mb-8 max-w-xl mx-auto">
          <strong>Detalhe do erro:</strong> {error.message}
          {error.digest && <span className="block mt-1 text-xs">Digest: {error.digest}</span>}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          variant="outline"
          size="lg"
          className="border-primary text-primary hover:bg-primary/10"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Tentar Novamente
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <a href="/">
            <Home className="mr-2 h-5 w-5" />
            Voltar para a Página Inicial
          </a>
        </Button>
      </div>
    </div>
  );
}
