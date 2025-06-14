
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProductById, updateProduct, type ProductUpdateData, type Product } from '@/app/actions/productActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const productFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }).max(100, { message: 'O nome não pode exceder 100 caracteres.' }),
  description: z.string().max(1000, { message: 'A descrição não pode exceder 1000 caracteres.' }), // Removido .min(10)
  image: z.string().url({ message: 'Por favor, insira uma URL de imagem válida.' }).or(z.literal('')).optional(),
  category: z.string().min(2, { message: 'A categoria deve ter pelo menos 2 caracteres.' }).max(50, { message: 'A categoria não pode exceder 50 caracteres.' }),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorLoadingProduct, setErrorLoadingProduct] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      category: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoadingProduct(true);
        setErrorLoadingProduct(null);
        try {
          const fetchedProduct = await getProductById(productId);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            form.reset({
              name: fetchedProduct.name || '',
              description: fetchedProduct.description || '',
              image: fetchedProduct.image || '',
              category: fetchedProduct.category || '',
              is_active: fetchedProduct.is_active === undefined ? true : fetchedProduct.is_active,
            });
            setCurrentImageUrl(fetchedProduct.image || null);
          } else {
            setErrorLoadingProduct("Produto não encontrado.");
            toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
          }
        } catch (err) {
          console.error("Failed to fetch product:", err);
          const errorMessage = err instanceof Error ? err.message : "Falha ao carregar dados do produto.";
          setErrorLoadingProduct(errorMessage);
          toast({ title: "Erro ao Carregar", description: errorMessage, variant: "destructive" });
        } finally {
          setIsLoadingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [productId, form, toast]);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const updateData: ProductUpdateData = {
        name: data.name,
        description: data.description,
        image: data.image,
        category: data.category,
        is_active: data.is_active,
      };
      const result = await updateProduct(productId, updateData);
      if (result.success && result.product) {
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso.",
        });
        setProduct(result.product); // Update local product state with returned data
        form.reset(result.product); // Reset form with fresh data (especially if backend modifies something)
        setCurrentImageUrl(result.product.image || null);
        // router.push('/admin/produtos'); // Optional: redirect after save
      } else {
        toast({
          title: "Erro ao Atualizar",
          description: result.message || "Não foi possível salvar as alterações.",
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
  
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('image', e.target.value);
    setCurrentImageUrl(e.target.value);
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="mb-8 flex justify-between items-center">
          <Skeleton className="h-10 w-1/3 bg-muted/50" />
          <Skeleton className="h-10 w-36 bg-muted/50" />
        </div>
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
          <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
          <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
          <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
          <Skeleton className="h-20 w-full mb-4 bg-muted/50" />
          <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
          <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
          <Skeleton className="h-8 w-1/4 mb-1 bg-muted/50" />
          <Skeleton className="h-10 w-full mb-4 bg-muted/50" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24 bg-muted/50" />
            <Skeleton className="h-6 w-12 bg-muted/50" />
          </div>
          <Skeleton className="h-12 w-full bg-primary/50" />
        </div>
      </div>
    );
  }

  if (errorLoadingProduct) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Erro ao Carregar Produto</h2>
        <p className="text-muted-foreground mb-6">{errorLoadingProduct}</p>
        <Button asChild variant="outline">
          <Link href="/admin/produtos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Produtos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-headline">
            Editar Produto
          </h2>
          <p className="text-muted-foreground mt-1">
            Modifique os detalhes do produto #{productId?.substring(0, 8)}.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10">
          <Link href="/admin/produtos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Produtos
          </Link>
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
        
        {currentImageUrl ? (
          <div className="mb-4 p-2 border border-border/50 rounded-lg bg-muted/20 flex flex-col items-center">
             <Image
                src={currentImageUrl}
                alt={form.getValues('name') || "Pré-visualização da imagem"}
                width={150}
                height={150}
                className="rounded-md object-contain aspect-square max-h-[150px] max-w-[150px]"
                onError={() => setCurrentImageUrl(null)} // Handle broken image links
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">Pré-visualização da Imagem Atual</p>
          </div>
        ) : (
           <div className="mb-4 p-4 border border-border/50 rounded-lg bg-muted/20 flex flex-col items-center justify-center h-[150px] w-[150px] mx-auto">
             <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
             <p className="text-xs text-muted-foreground text-center">Sem imagem ou URL inválida</p>
           </div>
        )}

        <div>
          <Label htmlFor="name" className="text-foreground/80">Nome do Produto</Label>
          <Input
            id="name"
            {...form.register('name')}
            className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.name ? 'border-destructive ring-destructive' : ''}`}
            placeholder="Ex: Tênis Esportivo Ultra Leve"
          />
          {form.formState.errors.name && <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="description" className="text-foreground/80">Descrição</Label>
          <Textarea
            id="description"
            {...form.register('description')}
            rows={5}
            className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.description ? 'border-destructive ring-destructive' : ''}`}
            placeholder="Detalhes sobre o produto, materiais, diferenciais..."
          />
          {form.formState.errors.description && <p className="mt-1 text-xs text-destructive">{form.formState.errors.description.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <Label htmlFor="image" className="text-foreground/80">URL da Imagem</Label>
            <Input
                id="image"
                type="url"
                {...form.register('image')}
                onChange={handleImageInputChange} // Use custom handler
                className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.image ? 'border-destructive ring-destructive' : ''}`}
                placeholder="https://exemplo.com/imagem.png"
            />
            {form.formState.errors.image && <p className="mt-1 text-xs text-destructive">{form.formState.errors.image.message}</p>}
            </div>

            <div>
            <Label htmlFor="category" className="text-foreground/80">Categoria</Label>
            <Input
                id="category"
                {...form.register('category')}
                className={`mt-1 bg-background/70 focus:bg-background ${form.formState.errors.category ? 'border-destructive ring-destructive' : ''}`}
                placeholder="Ex: Calçados Esportivos"
            />
            {form.formState.errors.category && <p className="mt-1 text-xs text-destructive">{form.formState.errors.category.message}</p>}
            </div>
        </div>


        <div className="flex items-center space-x-3 pt-2">
          <Switch
            id="is_active"
            checked={form.watch('is_active')}
            onCheckedChange={(checked) => form.setValue('is_active', checked)}
            aria-label="Produto ativo"
          />
          <Label htmlFor="is_active" className="text-foreground/80 cursor-pointer">
            Produto Ativo <span className="text-xs text-muted-foreground"> (Visível na loja)</span>
          </Label>
        </div>
        {form.formState.errors.is_active && <p className="text-xs text-destructive">{form.formState.errors.is_active.message}</p>}


        <Button 
          type="submit" 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-lg" 
          disabled={isSubmitting || isLoadingProduct}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </form>
    </div>
  );
}

    