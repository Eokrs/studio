
import { getProductById } from '@/app/actions/productActions';
import { getSiteSettings } from '@/app/actions/settingsActions';
import { ProductPurchasePanel } from '@/components/products/ProductPurchasePanel';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const product = await getProductById(params.productId);
  const settings = await getSiteSettings();

  if (!product) {
    return {
      title: `Produto não encontrado | ${settings.siteName}`,
      description: 'O produto que você está procurando não existe ou foi removido.',
    };
  }

  const description = product.description ? product.description.substring(0, 150) : '';

  return {
    title: `${product.name} | ${settings.siteName}`,
    description: description,
    keywords: [product.name, product.category, ...settings.seoKeywords],
    openGraph: {
      title: `${product.name} | ${settings.siteName}`,
      description: product.description || '',
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: { productId:string } }) {
  const product = await getProductById(params.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 mt-16 md:mt-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Coluna da Imagem */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden glass-card p-2 shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover w-full h-full rounded-lg"
            priority
            data-ai-hint="shoe fashion"
          />
        </div>
        
        {/* Coluna de Informações e Compra */}
        <div className="flex flex-col">
          <ProductPurchasePanel product={product} />
        </div>
      </div>
    </div>
  );
}
