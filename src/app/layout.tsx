import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://keen-compassion-production-46e6.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bleed — How Much Do Canadian Banks Charge for FX? | Free Audit Tool by Loop",
    template: "%s | Bleed by Loop",
  },
  description:
    "Canadian banks hide 2.5–3% markups on every foreign exchange transaction. Discover hidden bank charges from RBC, TD, BMO, Scotiabank & CIBC. Upload your bank statement and see exactly how much you're losing with our free FX audit tool.",
  keywords: [
    "bank FX fees Canada",
    "hidden bank charges",
    "RBC exchange rate markup",
    "TD FX markup",
    "Canadian bank foreign exchange fees",
    "FX audit tool",
    "how much does my bank charge for FX",
    "foreign exchange markup",
    "FX fees",
    "Canadian bank fees",
    "currency conversion costs",
    "BMO FX markup",
    "Scotiabank exchange rate",
    "CIBC foreign exchange fees",
    "hidden FX fees Canada",
    "bank statement audit",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Your Bank Is Bleeding You Dry — See Your Hidden FX Fees",
    description:
      "Canadian banks hide billions in FX markups. RBC, TD, BMO charge 2.5–3% on every transaction. Upload your statement and see your real cost. Free FX audit tool by Loop.",
    url: SITE_URL,
    siteName: "Bleed by Loop",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bleed — Your bank is bleeding you dry. Free FX Audit Tool by Loop.",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Bank Is Bleeding You Dry — See Your Hidden FX Fees",
    description:
      "Canadian banks hide 2.5–3% on every FX transaction. See exactly how much RBC, TD, BMO & others charge you. Free audit tool.",
    images: ["/opengraph-image"],
    creator: "@bankonloop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { SignupModalProvider } from "@/components/SignupModalProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Loop Financial Inc.",
      url: "https://bankonloop.com",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-full.svg`,
      },
      sameAs: [
        "https://twitter.com/bankonloop",
        "https://www.linkedin.com/company/bankonloop",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "Bleed — FX Audit Tool",
      url: SITE_URL,
      description:
        "Free tool to audit your Canadian bank statements and uncover hidden foreign exchange markups from RBC, TD, BMO, Scotiabank, and CIBC.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CAD",
      },
      creator: {
        "@type": "Organization",
        name: "Loop Financial Inc.",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Bleed by Loop",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the mid-market exchange rate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The mid-market rate is the real exchange rate that banks and institutions use to trade currencies between themselves. This is the fair rate before any markup is applied.",
          },
        },
        {
          "@type": "Question",
          name: "How much do Canadian banks mark up on foreign exchange?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Canadian banks like RBC, TD, BMO, Scotiabank, and CIBC typically add 2–3% markup on top of the mid-market rate. They don't disclose this — they just show you 'their rate' as if it's the market price.",
          },
        },
        {
          "@type": "Question",
          name: "What are the hidden fees on international wire transfers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "On top of FX markups, banks charge $25–$50 per wire transfer for sending, and the receiving bank often takes a cut too. Combined with the FX markup, a single $13,520 conversion can cost $393 in hidden fees.",
          },
        },
        {
          "@type": "Question",
          name: "How much can hidden bank FX fees cost a business annually?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For a business doing 10 FX transactions per month at $13,520 average, hidden fees can total nearly $47,160 per year — the equivalent of a full-time employee's salary.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <SignupModalProvider>{children}</SignupModalProvider>
      </body>
    </html>
  );
}
