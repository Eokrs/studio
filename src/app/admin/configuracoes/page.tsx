
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Settings, Image as ImageIcon, ExternalLink, ShieldCheck, Construction, Info } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const settingCategories = [
    {
      title: 'Configurações do Site',
      description: 'Ajuste informações globais como nome da loja, meta tags para SEO (título, descrição), e talvez o logo principal.',
      icon: Settings,
      status: 'Em breve',
      details: 'Permitirá editar o título padrão do site, descrição para mecanismos de busca e palavras-chave.',
    },
    {
      title: 'Banner da Home Page',
      description: 'Faça upload e gerencie os banners promocionais exibidos na página inicial da sua loja.',
      icon: ImageIcon,
      status: 'Em breve',
      details: 'Interface para upload de novas imagens de banner e reordenação/exclusão dos existentes.',
    },
    {
      title: 'Integrações de API',
      description: 'Conecte serviços externos, como chaves de API para WhatsApp Business, Google Analytics, ou gateways de pagamento PIX.',
      icon: ExternalLink,
      status: 'Em breve',
      details: 'Campos para inserir e validar chaves de API de serviços de terceiros.',
    },
    {
      title: 'Segurança e Acesso',
      description: 'Gerencie configurações de segurança, como alteração de senha do administrador (requer implementação cuidadosa).',
      icon: ShieldCheck,
      status: 'Em breve',
      details: 'Funcionalidade para alterar a senha da conta administrativa atual.',
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-headline">
            Configurações Gerais
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações globais da sua Nuvyra Store.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-xl shadow-xl mb-8">
        <div className="mb-6 p-4 border border-amber-500/30 dark:border-amber-500/70 bg-amber-500/10 dark:bg-amber-500/20 rounded-md text-amber-700 dark:text-amber-400">
          <Construction className="inline-block h-5 w-5 mr-2 align-middle" />
          <strong className="font-semibold">Funcionalidade em Desenvolvimento:</strong> Esta seção de configurações está em construção.
          A implementação de cada item abaixo requer lógica de backend específica para armazenar e aplicar as configurações de forma segura.
          Os cards abaixo são representações conceituais de como as configurações poderão ser gerenciadas futuramente.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingCategories.map((category) => (
          <Card key={category.title} className="glass-card flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
              <div className="p-2 bg-primary/10 rounded-md">
                 <category.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground font-headline">{category.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{category.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm p-3 bg-muted/30 dark:bg-muted/20 rounded-md border border-border/30">
                <p className="font-medium text-foreground/80">Detalhes Planejados:</p>
                <p className="text-xs text-muted-foreground mt-1">{category.details}</p>
              </div>
            </CardContent>
            <div className="p-4 pt-2 text-right">
                <Button variant="outline" size="sm" disabled className="border-primary/40 text-primary/70 cursor-not-allowed">
                    {category.status}
                </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
