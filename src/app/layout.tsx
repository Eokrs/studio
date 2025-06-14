
'use client'; // Necessário para usar usePathname

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation'; // Importar usePathname
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';

// --- SEO Metadata Configuration ---
// A exportação de metadata ainda funciona em Client Components,
// mas geralmente é recomendado que metadados fiquem em Server Components.
// No entanto, para este caso específico de layout raiz, é comum.
// Se preferir, podemos mover a exportação para um page.tsx separado se necessário.

// const siteUrl = 'https://www.nuvyra.store'; 
// const storeName = 'Nuvyra Store';
// const mainTitle = `${storeName}: Tênis Importados da China 1:1 - Qualidade Premium e Estilo`;
// const mainDescription = `Explore a ${storeName}, sua vitrine exclusiva de tênis importados da China com qualidade 1:1. Encontre modelos autênticos e cobiçados de Nike, Adidas, Balenciaga, Jordan, Yeezy e mais. Design premium e aparência impecável.`;
// const mainKeywords = [
//   'tênis importados',
//   'qualidade 1:1',
//   'tênis premium',
//   'réplicas de tênis',
//   'Nuvyra Store',
//   'Nike importado',
//   'Adidas importado',
//   'Balenciaga tênis',
//   'Air Jordan China',
//   'Yeezy China',
//   'calçados importados Brasil',
//   'vitrine de tênis online',
//   'melhores réplicas tênis',
// ];
// const ogImageUrl = 'https://placehold.co/1200x630.png'; 
// const ogImageAlt = `Vitrine de tênis importados ${storeName} - Modelos exclusivos e qualidade premium.`;

// export const metadata: Metadata = { // Metadata type import might need to be adjusted if Metadata type is not available directly here
//   metadataBase: new URL(siteUrl),
//   title: {
//     default: mainTitle,
//     template: `%s | ${storeName}`, 
//   },
//   description: mainDescription,
//   keywords: mainKeywords,
  
//   openGraph: {
//     title: mainTitle,
//     description: mainDescription,
//     url: siteUrl,
//     siteName: storeName,
//     images: [
//       {
//         url: ogImageUrl, 
//         width: 1200,
//         height: 630,
//         alt: ogImageAlt,
//       },
//     ],
//     locale: 'pt_BR',
//     type: 'website',
//   },

//   twitter: {
//     card: 'summary_large_image',
//     title: mainTitle,
//     description: mainDescription,
//     images: [
//       {
//         url: ogImageUrl, 
//         width: 1200,
//         height: 630,
//         alt: ogImageAlt,
//       }
//     ],
//   },

//   robots: { 
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: false, 
//       'max-image-preview': 'large',
//       'max-snippet': -1, 
//     },
//   },
//   icons: null,
// };

// Se você precisar que metadata seja um objeto estático (Server Component behavior),
// e ainda usar usePathname, você precisaria de uma estrutura diferente,
// possivelmente envolvendo um componente intermediário.
// Por agora, vamos manter a simplicidade.
// Next.js tem melhorado o suporte para metadados em layouts de cliente.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
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
          <CartProvider>
            {!isAdminPage && <Header />}
            <main>{children}</main>
            {!isAdminPage && <Footer />}
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
