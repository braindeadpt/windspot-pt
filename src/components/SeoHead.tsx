'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, any>;
}

export default function SeoHead({ 
  title, 
  description, 
  image = '/og-image.svg', 
  type = 'website',
  jsonLd 
}: SeoProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseUrl = 'https://ventu.surf';
  const url = `${baseUrl}${pathname}`;

  const fullTitle = title 
    ? `${title} | VenTu` 
    : 'VenTu — Condições em Tempo Real para Desportos Náuticos';

  const fullDesc = description 
    || 'Condições em tempo real para surf, kitesurf, windsurf e big wave em Portugal. Ondas, vento e temperatura da água para 81 spots.';

  if (!mounted) return null;

  return (
    <>
      {/* Dynamic OpenGraph */}
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:site_name" content="VenTu" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />

      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}