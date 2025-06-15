
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, updateSiteSettings } from '@/app/actions/settingsActions';
import { SiteSettingsSchema, type SiteSettings } from '@/types/settings';
import { ArrowLeft, Settings, Image as ImageIcon, ExternalLink, ShieldCheck, Construction, Save, Loader2, AlertTriangle } from 'lucide-react';

// Type for the form's direct input values (what react-hook-form manages)
type AdminSettingsFormInputValues = {
  siteName: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  seoKeywordsString: string; // This is what the <Input> gives
};

// Zod schema for validating the form inputs.
// This schema's output type will be AdminSettingsFormInputValues.
const AdminSettingsFormInputSchema = z.object({
  siteName: SiteSettingsSchema.shape.siteName, // Reuse validation from canonical SiteSettingsSchema
  defaultSeoTitle: SiteSettingsSchema.shape.defaultSeoTitle,
  defaultSeoDescription: SiteSettingsSchema.shape.defaultSeoDescription,
  seoKeywordsString: z.string()
    .min(1, 'Forneça ao menos uma palavra-chave.') // Base validation for the input string
    .superRefine((val, ctx) => {
      const keywords = val.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      // Validate against the array count rule from SiteSettingsSchema.shape.seoKeywords
      const arrayMinLengthRule = SiteSettingsSchema.shape.seoKeywords._def.checks.find(c => c.kind === 'min');
      if (arrayMinLengthRule && keywords.length < (arrayMinLengthRule as { value: number }).value) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: (arrayMinLengthRule as { value: number }).value,
          type: "array", // conceptually, it's about the array of keywords
          inclusive: true,
          message: arrayMinLengthRule.message || `Deve haver pelo menos ${(arrayMinLengthRule as { value: number }).value} palavra(s)-chave.`,
          path: ['seoKeywordsString']
        });
        return; // Stop if not enough keywords
      }
      if (keywords.length === 0 && !arrayMinLengthRule) { // Fallback if min rule not found or specific message desired
         ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Forneça ao menos uma palavra-chave válida.",
          path: ['seoKeywordsString']
        });
        return;
      }
      
      // Validate each individual keyword against the sub-schema from SiteSettingsSchema.shape.seoKeywords
      const individualKeywordSchema = (SiteSettingsSchema.shape.seoKeywords as z.ZodArray<z.ZodString, "many">).element;
      keywords.forEach(keyword => {
        const validationResult = individualKeywordSchema.safeParse(keyword);
        if (!validationResult.success) {
          validationResult.error.issues.forEach(issue => {
            ctx.addIssue({
              ...issue, // Spread issue properties
              message: `Palavra-chave "${keyword}": ${issue.message}`, // Custom message to identify the keyword
              path: ['seoKeywordsString'] // Attribute all keyword errors to the seoKeywordsString input field
            });
          });
        }
      });
    })
});


export default function AdminConfiguracoesPage() {
  const { toast } = useToast();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  // useForm is typed with AdminSettingsFormInputValues (the shape of the form fields)
  const form = useForm<AdminSettingsFormInputValues>({ 
    resolver: zodResolver(AdminSettingsFormInputSchema), // This schema validates AdminSettingsFormInputValues
    defaultValues: {
      siteName: '',
      defaultSeoTitle: '',
      defaultSeoDescription: '',
      seoKeywordsString: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      setInitialLoadError(null);
      try {
        const settings: SiteSettings = await getSiteSettings(); // Fetches SiteSettings
        // Reset form with AdminSettingsFormInputValues, converting array to string
        form.reset({ 
          siteName: settings.siteName,
          defaultSeoTitle: settings.defaultSeoTitle,
          defaultSeoDescription: settings.defaultSeoDescription,
          seoKeywordsString: settings.seoKeywords.join(', '), 
        });
      } catch (error) {
        console.error("Failed to load site settings:", error);
        const errorMessage = error instanceof Error ? error.message : "Falha ao carregar configurações.";
        setInitialLoadError(errorMessage);
        toast({ title: "Erro ao Carregar", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  // onSubmit receives AdminSettingsFormInputValues (validated form data)
  const onSubmit: SubmitHandler<AdminSettingsFormInputValues> = async (formData) => {
    setIsSubmitting(true);
    
    // Transform formData (AdminSettingsFormInputValues) to SiteSettings
    const settingsToSave: SiteSettings = {
      siteName: formData.siteName,
      defaultSeoTitle: formData.defaultSeoTitle,
      defaultSeoDescription: formData.defaultSeoDescription,
      seoKeywords: formData.seoKeywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0),
    };

    try {
      const result = await updateSiteSettings(settingsToSave); // Pass SiteSettings object
      
      if (result.success && result.settings) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        // Reset form with AdminSettingsFormInputValues, converting array back to string
        form.reset({
          siteName: result.settings.siteName,
          defaultSeoTitle: result.settings.defaultSeoTitle,
          defaultSeoDescription: result.settings.defaultSeoDescription,
          seoKeywordsString: result.settings.seoKeywords.join(', '),
        });
      } else {
        toast({
          title: "Erro ao Salvar",
          description: result.message || "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro Inesperado",
        description: e.message || "Ocorreu um erro durante a atualização.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const otherSettingCategories = [
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

      <Card className="glass-card mb-8">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
          <div className="p-2 bg-primary/10 rounded-md">
             <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-foreground font-headline">Configurações do Site</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Ajuste informações globais como nome da loja e meta tags para SEO.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
              <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
              <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
              <Skeleton className="h-20 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
              <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
              <Skeleton className="h-12 w-full bg-primary/50" />
            </div>
          ) : initialLoadError ? (
             <div className="flex flex-col items-center justify-center text-center p-6 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                <p className="text-destructive font-medium">Erro ao carregar configurações:</p>
                <p className="text-destructive/80 text-sm">{initialLoadError}</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-4">Tentar Novamente</Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="siteName" className="text-foreground/80">Nome da Loja</Label>
                <Input
                  id="siteName"
                  {...form.register('siteName')}
                  className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.siteName ? 'border-destructive ring-destructive' : ''}`}
                  placeholder="Ex: Minha Loja Incrível"
                />
                {form.formState.errors.siteName && <p className="mt-1 text-xs text-destructive">{form.formState.errors.siteName.message}</p>}
              </div>

              <div>
                <Label htmlFor="defaultSeoTitle" className="text-foreground/80">Título SEO Padrão</Label>
                <Input
                  id="defaultSeoTitle"
                  {...form.register('defaultSeoTitle')}
                  className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.defaultSeoTitle ? 'border-destructive ring-destructive' : ''}`}
                  placeholder="Ex: Minha Loja - Produtos de Alta Qualidade"
                />
                {form.formState.errors.defaultSeoTitle && <p className="mt-1 text-xs text-destructive">{form.formState.errors.defaultSeoTitle.message}</p>}
              </div>

              <div>
                <Label htmlFor="defaultSeoDescription" className="text-foreground/80">Descrição SEO Padrão</Label>
                <Textarea
                  id="defaultSeoDescription"
                  {...form.register('defaultSeoDescription')}
                  rows={3}
                  className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.defaultSeoDescription ? 'border-destructive ring-destructive' : ''}`}
                  placeholder="Descreva sua loja e seus principais produtos para os mecanismos de busca."
                />
                {form.formState.errors.defaultSeoDescription && <p className="mt-1 text-xs text-destructive">{form.formState.errors.defaultSeoDescription.message}</p>}
              </div>

              <div>
                <Label htmlFor="seoKeywordsString" className="text-foreground/80">Palavras-chave SEO</Label>
                 <Input
                  id="seoKeywordsString"
                  {...form.register('seoKeywordsString')}
                  className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.seoKeywordsString ? 'border-destructive ring-destructive' : ''}`}
                  placeholder="Ex: tênis, moda, qualidade, importados"
                />
                <p className="text-xs text-muted-foreground mt-1">Separe as palavras-chave por vírgula.</p>
                {form.formState.errors.seoKeywordsString && <p className="mt-1 text-xs text-destructive">{form.formState.errors.seoKeywordsString.message}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-lg" 
                disabled={isSubmitting || isLoadingSettings}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações do Site
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 p-4 border border-amber-500/30 dark:border-amber-500/70 bg-amber-500/10 dark:bg-amber-500/20 rounded-md text-amber-700 dark:text-amber-400">
        <Construction className="inline-block h-5 w-5 mr-2 align-middle" />
        <strong className="font-semibold">Outras Configurações em Desenvolvimento:</strong> As seções abaixo são representações de funcionalidades futuras.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {otherSettingCategories.map((category) => (
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
    

    