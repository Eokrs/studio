import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/app/actions/productActions';
import { ProductPurchasePanel } from '@/components/products/ProductPurchasePanel';
import { getSiteSettings } from '@/app/actions/settingsActions';
import type { Metadata } from 'next';

interface Props {
  params: { productId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [product, settings] = await Promise.all([
    getProductById(params.productId),
    getSiteSettings(),
  ]);

  if (!product) {
    return {
      title: `Produto não encontrado | ${settings.siteName}`,
      description: "O produto que você está procurando não foi encontrado ou não está mais disponível.",
    };
  }

  const description = product.description ? product.description.substring(0, 160) : settings.defaultSeoDescription;

  return {
    title: `${product.name} | ${settings.siteName}`,
    description: description,
    keywords: [product.name, product.category, ...settings.seoKeywords],
    openGraph: {
      title: `${product.name} | ${settings.siteName}`,
      description: description,
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

export default async function ProductPage({ params }: Props) {
  const product = await getProductById(params.productId);

  if (!product || !product.is_active) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28 md:py-16 lg:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Coluna da Imagem */}
        <div className="w-full">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg glass-card p-2">
                <Image
                    src={product.image}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full rounded-md"
                    priority
                />
            </div>
            {/* Miniaturas podem ser adicionadas aqui no futuro */}
        </div>

        {/* Coluna de Informações e Compra */}
        <div className="w-full">
            <ProductPurchasePanel product={product} />
        </div>
      </div>
    </div>
  );
}
