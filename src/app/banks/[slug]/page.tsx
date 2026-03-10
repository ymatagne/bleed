import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BankPageClient from "./BankPageClient";

const BANKS: Record<
  string,
  {
    name: string;
    fullName: string;
    markup: number;
    color: string;
    description: string;
  }
> = {
  rbc: {
    name: "RBC",
    fullName: "Royal Bank of Canada",
    markup: 2.5,
    color: "#003168",
    description:
      "RBC is Canada's largest bank by market cap, yet their FX markup of ~2.5% quietly drains thousands from businesses every year. On a $10,000 USD conversion, that's $250 you never see.",
  },
  td: {
    name: "TD",
    fullName: "TD Canada Trust",
    markup: 2.6,
    color: "#34A853",
    description:
      "TD markets convenience, but their ~2.6% FX markup is anything but convenient for your bottom line. A $10,000 USD conversion costs you $260 in hidden fees.",
  },
  bmo: {
    name: "BMO",
    fullName: "Bank of Montreal",
    markup: 2.4,
    color: "#0075BE",
    description:
      "BMO's ~2.4% FX markup might look modest, but it compounds fast. A business converting $50,000/month loses over $14,400 per year to BMO's hidden spread.",
  },
  scotiabank: {
    name: "Scotiabank",
    fullName: "Bank of Nova Scotia",
    markup: 2.5,
    color: "#EC111A",
    description:
      "Scotiabank calls itself 'Canada's international bank,' yet they charge ~2.5% on every FX transaction. International banking shouldn't mean internationally expensive.",
  },
  cibc: {
    name: "CIBC",
    fullName: "Canadian Imperial Bank of Commerce",
    markup: 2.7,
    color: "#8B0000",
    description:
      "CIBC has the highest FX markup among the Big Five at ~2.7%. On $10,000 USD, that's $270 in hidden fees — more than any competitor.",
  },
};

const ALL_SLUGS = Object.keys(BANKS);

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bank = BANKS[slug];
  if (!bank) return {};

  const title = `${bank.name} FX Fees — How Much Does ${bank.name} Charge for Foreign Exchange?`;
  const description = `${bank.name} hides a ~${bank.markup}% markup on every foreign exchange transaction. See exactly how much ${bank.fullName} charges and what it's costing you.`;
  const baseUrl =
    "https://keen-compassion-production-46e6.up.railway.app";

  return {
    title,
    description,
    keywords: [
      `${bank.name} FX fees`,
      `${bank.name} exchange rate markup`,
      `${bank.name} hidden charges`,
      `${bank.name} foreign exchange fees`,
      `${bank.name} currency conversion cost`,
      `${bank.fullName} FX markup`,
      `how much does ${bank.name} charge for FX`,
    ],
    alternates: { canonical: `${baseUrl}/banks/${slug}` },
    openGraph: {
      title: `${bank.name} Charges ~${bank.markup}% on Every FX Transaction`,
      description,
      url: `${baseUrl}/banks/${slug}`,
      siteName: "Bleed by Loop",
      type: "article",
    },
  };
}

export default async function BankPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bank = BANKS[slug];
  if (!bank) notFound();

  const otherBanks = ALL_SLUGS.filter((s) => s !== slug).map((s) => ({
    slug: s,
    ...BANKS[s],
  }));

  return (
    <>
      <Nav />
      <BankPageClient bank={{ slug, ...bank }} otherBanks={otherBanks} />
      <Footer />
    </>
  );
}
