// src/components/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { getTranslations } from '@/lib/translations';

interface BreadcrumbItem {
  name: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  lang: string;
  items?: BreadcrumbItem[];
  toolName?: string;
  categoryName?: string;
}

export default function Breadcrumbs({ lang, items, toolName, categoryName }: BreadcrumbsProps) {
  const pathname = usePathname();
  const t = getTranslations(lang);
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: t('nav_catalog'), href: `/${lang}` }
    ];

    // Extract path segments
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.includes('tool')) {
      if (segments.length === 2) {
        // /[lang]/tool
        breadcrumbs.push({ 
          name: t('tools_page_title'), 
          href: `/${lang}/tool`,
          isCurrentPage: true 
        });
      } else if (segments.length === 3 && segments[2] !== 'add') {
        // /[lang]/tool/[slug]
        breadcrumbs.push({ 
          name: t('tools_page_title'), 
          href: `/${lang}/tool` 
        });
        breadcrumbs.push({ 
          name: toolName || 'Tool', 
          href: pathname,
          isCurrentPage: true 
        });
      } else if (segments.includes('add')) {
        // /[lang]/tool/add
        breadcrumbs.push({ 
          name: t('tools_page_title'), 
          href: `/${lang}/tool` 
        });
        breadcrumbs.push({ 
          name: t('add_tool_page_title'), 
          href: `/${lang}/tool/add`,
          isCurrentPage: true 
        });
      }
    } else if (segments.includes('category')) {
      // /[lang]/category/[slug]
      breadcrumbs.push({ 
        name: t('tools_page_title'), 
        href: `/${lang}/tool` 
      });
      breadcrumbs.push({ 
        name: categoryName || 'Category', 
        href: pathname,
        isCurrentPage: true 
      });
    } else if (segments.includes('blog')) {
      if (segments.length === 2) {
        // /[lang]/blog
        breadcrumbs.push({ 
          name: 'Blog', 
          href: `/${lang}/blog`,
          isCurrentPage: true 
        });
      } else {
        // /[lang]/blog/[slug]
        breadcrumbs.push({ 
          name: 'Blog', 
          href: `/${lang}/blog` 
        });
        breadcrumbs.push({ 
          name: 'Article', 
          href: pathname,
          isCurrentPage: true 
        });
      }
    } else if (segments.includes('about')) {
      breadcrumbs.push({ 
        name: t('about_title'), 
        href: `/${lang}/about`,
        isCurrentPage: true 
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Generate JSON-LD structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.href}`
    }))
  };

  if (breadcrumbs.length <= 1) return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-foreground/70">
          <li>
            <Link
              href={`/${lang}`}
              className="flex items-center hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-foreground/50" />
              {item.isCurrentPage ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}