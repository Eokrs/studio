import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 text-center border-t border-border/50">
      <div className="container mx-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Nuvyra Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
