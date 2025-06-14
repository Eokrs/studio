
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, deleteProduct } from '@/app/actions/productActions';
import type { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ArrowLeft, PlusCircle, Edit3, Trash2, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRODUCTS_PER_PAGE = 20;

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async (loadMore = false) => {
    if (!loadMore) {
      setIsLoading(true);
      setProducts([]); // Reset products only if it's not loading more
      setOffset(0);     // Reset offset only if it's not loading more
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const currentOffset = loadMore ? offset : 0;
      const fetchedProducts = await getProducts({ limit: PRODUCTS_PER_PAGE, offset: currentOffset });
      
      if (fetchedProducts.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setProducts(prevProducts => loadMore ? [...prevProducts, ...fetchedProducts] : fetchedProducts);
      setOffset(currentOffset + fetchedProducts.length);

    } catch (err: any) {
      console.error("Failed to fetch products for admin:", err);
      const errorMessage = err.message || "Falha ao carregar os produtos. Tente novamente mais tarde.";
      setError(errorMessage);
      if (!loadMore) {
        toast({
          title: "Erro ao Carregar Produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, offset]); // offset dependency is important for loadMore

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchProducts is memoized, so this will run once on mount.

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchProducts(true);
    }
  };

  const handleConfirmDelete = async (productId: string, productName: string) => {
    const result = await deleteProduct(productId);
    if (result.success) {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      toast({
        title: "Produto Excluído",
        description: `O produto "${productName}" foi excluído com sucesso.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erro ao Excluir",
        description: result.message || "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const AdminPageHeader = () => (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-foreground font-headline">
            Gerenciar Produtos
            </h2>
            <p className="text-muted-foreground mt-1">
            Visualize, adicione, edite ou remova produtos da sua loja.
            </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => toast({ title: "Em breve!", description: "Funcionalidade de adicionar novo produto ainda não implementada."})} 
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/80 flex-1 sm:flex-initial"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Produto
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10 flex-1 sm:flex-initial">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
  
  const renderSkeletons = (count: number) => (
    Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="flex items-center space-x-4 p-4 glass-card rounded-lg">
          <Skeleton className="h-16 w-16 rounded-md bg-muted/50" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-3/4 bg-muted/50" />
            <Skeleton className="h-3 w-1/2 bg-muted/50" />
            <Skeleton className="h-3 w-1/4 bg-muted/50" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-8 w-20 rounded-md bg-muted/50" />
            <Skeleton className="h-8 w-20 rounded-md bg-muted/50" />
          </div>
        </div>
      ))
  );

  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <AdminPageHeader />
        <div className="space-y-3">
          {renderSkeletons(5)}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <AdminPageHeader />
        <Alert variant="destructive" className="glass-card items-start">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="ml-2">
            <AlertTitle>Erro ao Carregar Produtos</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={() => fetchProducts()} variant="link" className="p-0 h-auto text-destructive-foreground hover:underline ml-1 mt-1">
                Tentar novamente
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <AdminPageHeader />
      {products.length === 0 && !isLoading ? (
        <div className="text-center py-12 glass-card rounded-lg">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nenhum produto encontrado.</p>
          <p className="text-sm text-muted-foreground mt-1">Adicione seu primeiro produto para começar a vender.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto glass-card rounded-lg shadow-lg p-2 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[70px] sm:w-[80px] text-foreground/80 px-2 sm:px-4">Imagem</TableHead>
                  <TableHead className="text-foreground/80 px-2 sm:px-4">Nome</TableHead>
                  <TableHead className="text-foreground/80 px-2 sm:px-4 hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-foreground/80 px-2 sm:px-4 hidden lg:table-cell max-w-xs">Descrição</TableHead>
                  <TableHead className="text-right text-foreground/80 px-2 sm:px-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-b border-border/30 hover:bg-muted/20 dark:hover:bg-muted/10 align-top">
                    <TableCell className="px-2 sm:px-4 py-3">
                      <Image
                        src={product.image || 'https://placehold.co/64x64.png'}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="rounded-md object-cover aspect-square"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground px-2 sm:px-4 py-3">
                      {product.name}
                      <div className="text-xs text-muted-foreground md:hidden mt-1">{product.category}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground px-2 sm:px-4 py-3 hidden md:table-cell">{product.category}</TableCell>
                    <TableCell className="text-muted-foreground px-2 sm:px-4 py-3 hidden lg:table-cell">
                      <p className="truncate w-full max-w-[200px] xl:max-w-xs">
                          {product.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-right px-2 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs px-2 h-8">
                            <Link href={`/admin/produtos/edit/${product.id}`}>
                              <Edit3 className="mr-1 h-3.5 w-3.5" /> Editar
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 text-xs px-2 h-8"
                              >
                                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleConfirmDelete(product.id, product.name)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {isLoadingMore && (
                    <TableRow>
                        <TableCell colSpan={5}>
                            <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Carregando mais produtos...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {hasMore && !isLoadingMore && products.length > 0 && (
            <div className="mt-8 text-center">
              <Button onClick={handleLoadMore} variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                Carregar Mais Produtos
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
