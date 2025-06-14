
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext'; // Import CartProvider

// --- SEO Metadata Configuration ---

const siteUrl = 'https://www.nuvyra.store'; 
const storeName = 'Nuvyra Store';
const mainTitle = `${storeName}: Tênis Importados da China 1:1 - Qualidade Premium e Estilo`;
const mainDescription = `Explore a ${storeName}, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados de Nike, Adidas, Balenciaga, Jordan, Yeezy e mais. Design premium e aparência impecável.`;
const mainKeywords = [
  'tênis importados',
  'qualidade 1:1',
  'tênis premium',
  'réplicas de tênis',
  'Nuvyra Store',
  'Nike importado',
  'Adidas importado',
  'Balenciaga tênis',
  'Air Jordan China',
  'Yeezy China',
  'calçados importados Brasil',
  'vitrine de tênis online',
  'melhores réplicas tênis',
];
// URL de uma imagem representativa para Open Graph e Twitter Card (1200x630 pixels recomendado)
const ogImageUrl = 'https://placehold.co/1200x630.png'; // Substitua por uma imagem real da sua marca/produtos
const ogImageAlt = `Vitrine de tênis importados ${storeName} - Modelos exclusivos e qualidade premium.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), // Essencial para resolver URLs relativas de imagens em metadados
  title: {
    default: mainTitle, // Título padrão para a maioria das páginas
    template: `%s | ${storeName}`, // Modelo para títulos de páginas específicas (ex: "Nome do Produto | Nuvyra Store")
  },
  description: mainDescription,
  keywords: mainKeywords,
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: mainTitle,
    description: mainDescription,
    url: siteUrl, // URL canônica do site
    siteName: storeName,
    images: [
      {
        url: ogImageUrl, // Deve ser uma URL absoluta
        width: 1200,
        height: 630,
        alt: ogImageAlt,
      },
    ],
    locale: 'pt_BR',
    type: 'website', // Tipo de conteúdo
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image', // Tipo de card (outras opções: 'summary', 'app', 'player')
    title: mainTitle,
    description: mainDescription,
    images: [
      {
        url: ogImageUrl, // Deve ser uma URL absoluta
        width: 1200,
        height: 630,
        alt: ogImageAlt,
      }
    ],
    // creator: '@SeuTwitterHandle', // Opcional: Twitter handle do criador do conteúdo
    // site: '@SeuTwitterHandleDaLoja', // Opcional: Twitter handle do site/loja
  },

  // Outras meta tags úteis
  robots: { // Controla como os mecanismos de busca rastreiam e indexam seu site
    index: true, // Permitir indexação
    follow: true, // Permitir seguir links
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false, // Permitir indexação de imagens (importante para vitrine)
      'max-image-preview': 'large', // Mostrar prévias grandes de imagens nos resultados
      'max-snippet': -1, // Permitir que o Google escolha o tamanho do snippet
    },
  },
  // viewport: 'width=device-width, initial-scale=1', // Next.js já gerencia isso bem
  // authors: [{ name: 'Nuvyra Store Team', url: siteUrl }], // Opcional
  // generator: 'Next.js', // Opcional

  // Para páginas de produto específicas, você criaria metadados mais detalhados.
  // Exemplo de como você faria em uma page.tsx de um produto:
  //
  // export async function generateMetadata({ params }: { params: { slug: string }}) {
  //   const product = await getProductBySlug(params.slug); // Função fictícia para buscar dados do produto
  //   if (!product) {
  //     return { title: `Produto não encontrado | ${storeName}` };
  //   }
  //   const productTitle = `${product.name} - Importado Qualidade 1:1 | ${storeName}`;
  //   const productDescription = `Compre ${product.name} importado da China, qualidade 1:1. Detalhes autênticos e design premium na ${storeName}.`;
  //   const productImageUrl = product.imageUrl; // URL absoluta da imagem do produto
  //
  //   return {
  //     title: productTitle,
  //     description: productDescription,
  //     openGraph: {
  //       title: productTitle,
  //       description: productDescription,
  //       images: [{ url: productImageUrl, alt: `Foto do tênis ${product.name}` }],
  //       url: `${siteUrl}/produto/${params.slug}`,
  //     },
  //     twitter: {
  //       title: productTitle,
  //       description: productDescription,
  //       images: [{ url: productImageUrl, alt: `Foto do tênis ${product.name}` }],
  //     },
  //     // O alt text para a imagem do produto em si (<img> tag) seria algo como:
  //     // alt: `Tênis ${product.name} - ${product.brand} - Vista Frontal - Qualidade Premium Nuvyra Store`
  //     // E a estrutura H1/P na página do produto:
  //     // <h1>${product.name} - ${product.brand} - Importado Qualidade Premium</h1>
  //     // <p>Descubra o ${product.name}, uma réplica fiel importada diretamente da China...</p>
  //   };
  // }

  icons: null, // Mantido de uma correção anterior, para explicitamente não gerenciar favicons via metadata.
               // Se precisar de favicons, coloque-os na pasta /public ou defina aqui.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* As fontes já estão sendo importadas aqui, o que é bom. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider> {/* Wrap with CartProvider */}
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
