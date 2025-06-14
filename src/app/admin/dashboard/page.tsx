
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, LayoutDashboard, Package, Settings, ShoppingBag, BarChart3, Users, PencilLine } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        const {data: {user}} = await supabase.auth.getUser();
        if (user) {
            setUserEmail(user.email || 'Admin');
        } else {
            router.replace('/admin/login');
        }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Erro ao Sair',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logout realizado!',
        description: 'Você foi desconectado.',
      });
      router.replace('/admin/login');
    }
  };

  const adminSections = [
    { title: "Gerenciar Produtos", description: "Adicionar, editar ou remover produtos da sua vitrine.", icon: Package, href: "/admin/produtos", isImplemented: true },
    { title: "Visualizar Pedidos", description: "Acompanhar os pedidos recebidos via WhatsApp.", icon: ShoppingBag, href: "/admin/pedidos", isImplemented: true },
    { title: "Métricas", description: "Analisar o desempenho e engajamento dos usuários.", icon: BarChart3, href: "/admin/metricas", isImplemented: true },
    // { title: "Gerenciar Conteúdo", description: "Editar textos e seções do site (Sobre, Contato).", icon: PencilLine, href: "/admin/conteudo", isImplemented: false },
    // { title: "Gerenciar Usuários", description: "Administrar usuários e permissões.", icon: Users, href: "/admin/usuarios", isImplemented: false },
    { title: "Configurações", description: "Ajustar as configurações gerais do site e do painel.", icon: Settings, href: "/admin/configuracoes", isImplemented: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">
              Nuvyra Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
             {userEmail && <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {userEmail}</span>}
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="mb-8 p-6 md:p-8 text-center glass-card rounded-xl shadow-xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3 font-headline">
              Bem-vindo ao Painel!
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Gerencie sua loja Nuvyra Store com facilidade. Explore as seções abaixo para começar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminSections.map((section) => (
              <div 
                key={section.title} 
                className="p-6 glass-card rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
              >
                <section.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2 font-headline">{section.title}</h3>
                <p className="text-sm text-muted-foreground flex-grow">{section.description}</p>
                 {section.isImplemented ? (
                    <Button asChild variant="outline" size="sm" className="mt-4 w-full border-primary/50 text-primary hover:bg-primary/10">
                        <Link href={section.href}>Acessar</Link>
                    </Button>
                 ) : (
                    <Button variant="outline" size="sm" className="mt-4 w-full border-primary/50 text-primary hover:bg-primary/10" 
                        onClick={() => toast({title: "Em Breve!", description: `A seção '${section.title}' ainda não foi implementada.`})}
                    >
                        Acessar
                    </Button>
                 )}
              </div>
            ))}
          </div>
        </div>
      </main>
       <footer className="py-6 text-center border-t border-border/30 mt-auto">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nuvyra Store Admin Panel.
          </p>
        </footer>
    </div>
  );
}
