'use client';

import Link from 'next/link';
import type { Product } from '@/data/products';

interface BreadcrumbProps {
  product: Product;
}

export function Breadcrumb({ product }: BreadcrumbProps) {
  const items = [
    { label: 'Home', href: '/' },
    { label: product.category, href: '/' }, // Links to home, which has the product showcase
    { label: product.name, href: null }, // Current page, no link
  ];

  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-x-2">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              // The last item (current page) is not a link and is bolder
              <span className="font-medium text-foreground">{item.label}</span>
            )}
            {/* Render separator if it's not the last item */}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="select-none">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
