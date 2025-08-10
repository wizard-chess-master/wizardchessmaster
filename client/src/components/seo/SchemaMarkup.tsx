import React from 'react';

export function SchemaMarkup() {
  const gameSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Wizard Chess Master",
    "description": "Master wizard chess strategy with AI opponents, online tournaments, and magical 10x10 gameplay. Free chess training, tactics guide, and competitive ranking system.",
    "url": "https://wizardchessmaster.com",
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free to play with premium upgrade available"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "Wizard Chess Master"
    },
    "keywords": "wizard chess, chess strategy, chess AI, online chess, chess training, chess tactics, chess tournaments, chess game, magical chess, 10x10 chess, chess master, chess learning",
    "genre": "Strategy Game",
    "gamePlatform": "Web Browser",
    "numberOfPlayers": "1-2",
    "playMode": "SinglePlayer, MultiPlayer"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Wizard Chess Master",
    "url": "https://wizardchessmaster.com",
    "description": "Leading platform for wizard chess training and strategy development",
    "sameAs": [
      "https://wizardchessmaster.com"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is wizard chess?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wizard chess is an advanced chess variant played on a 10x10 board with magical wizard pieces that can teleport, cast spells, and execute special moves beyond traditional chess."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI training work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI uses neural networks and machine learning to adapt to your playing style, providing personalized coaching and difficulty adjustment based on your performance."
        }
      },
      {
        "@type": "Question",
        "name": "Is wizard chess master free to play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Wizard Chess Master offers unlimited free gameplay with AI opponents, tutorial mode, and basic features. Premium upgrade provides ad-free experience and unlimited hints."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}