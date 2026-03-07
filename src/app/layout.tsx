import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bleed — How Much Is Your Bank Stealing on FX? | Free Audit by Loop",
  description:
    "Canadian banks hide 2.5–3% markups on every FX transaction. Upload your bank statement and see exactly how much you're losing. Free audit tool by Loop.",
  keywords: [
    "FX fees",
    "foreign exchange markup",
    "Canadian bank fees",
    "FX audit",
    "Loop",
    "bankonloop",
    "hidden bank fees",
    "currency conversion costs",
  ],
  openGraph: {
    title: "Your bank is bleeding you dry.",
    description:
      "Canadian banks hide billions in FX markups. Upload your statement and see your real cost. Free tool by Loop.",
    url: "https://bleed.bankonloop.com",
    siteName: "Bleed by Loop",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Bleed — FX Audit Tool by Loop",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your bank is bleeding you dry.",
    description:
      "See exactly how much your bank hides in FX markups. Free audit tool by Loop.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
