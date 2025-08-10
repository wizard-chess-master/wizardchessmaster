import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BlogSEOProps {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  readTime?: string;
}

export function BlogSEO({ title, description, keywords, url, readTime = '10' }: BlogSEOProps) {
  const fullTitle = `${title} | Wizard Chess Master`;
  const canonicalUrl = `https://wizardchessmaster.com/blog/${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Wizard Chess Master" />
      <meta property="og:image" content="https://wizardchessmaster.com/og-chess-image.jpg" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://wizardchessmaster.com/twitter-chess-image.jpg" />

      {/* Article Meta Tags */}
      <meta property="article:author" content="Wizard Chess Master Team" />
      <meta property="article:section" content="Chess Strategy" />
      <meta property="article:tag" content={keywords.join(', ')} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description,
          "author": {
            "@type": "Organization",
            "name": "Wizard Chess Master"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Wizard Chess Master",
            "logo": {
              "@type": "ImageObject",
              "url": "https://wizardchessmaster.com/logo.png"
            }
          },
          "url": canonicalUrl,
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "keywords": keywords.join(', '),
          "articleBody": description,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "image": {
            "@type": "ImageObject",
            "url": "https://wizardchessmaster.com/blog-image.jpg",
            "width": 1200,
            "height": 630
          }
        })}
      </script>

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />

      {/* Reading Time */}
      {readTime && <meta name="reading-time" content={`${readTime} minutes`} />}
    </Helmet>
  );
}