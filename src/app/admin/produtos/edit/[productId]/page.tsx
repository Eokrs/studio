
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  // In a real scenario, you would fetch product data here using productId
  // const [product, setProduct] = useState<Product | null>(null);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   if (productId) {
  //     // Fetch product data
  //   }
  // }, [productId]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-headline">
              Editar Produto {productId ? `(ID: ${productId})` : ''}
            </h2>
            <p className="text-muted-foreground mt-1">
              Modifique os detalhes do produto.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10 flex-1 sm:flex-initial">
              <Link href="/admin/produtos">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Produtos
              </Link>
          </Button>
        </div>
      </div>

      <div className="glass-card p-8 rounded-lg shadow-xl text-center">
        <Construction className="h-16 w-16 text-primary mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-foreground mb-3 font-headline">
          Página em Construção
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          A funcionalidade de edição de produtos ainda está sendo desenvolvida.
          Em breve, você poderá modificar os detalhes do produto aqui.
        </p>
      </div>
    </div>
  );
}
