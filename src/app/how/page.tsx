import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How I Built This — Bleed by Loop",
  description:
    "How a WhatsApp message at 3 AM turned into a full marketing site — built entirely by AI, shipped before sunrise.",
  openGraph: {
    title: "How I Built This — Bleed by Loop",
    description:
      "How a WhatsApp message at 3 AM turned into a full marketing site — built entirely by AI, shipped before sunrise.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How I Built This — Bleed by Loop",
    description:
      "How a WhatsApp message at 3 AM turned into a full marketing site — built entirely by AI, shipped before sunrise.",
  },
};

async function getContent() {
  const filePath = path.join(process.cwd(), "HOW-I-BUILT-THIS.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const result = await remark().use(html).process(raw);
  return result.toString();
}

export default async function HowPage() {
  const htmlContent = await getContent();

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white pt-20">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <div
            className="prose prose-lg prose-green max-w-none
              prose-headings:text-[#004639] prose-headings:font-bold
              prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-[#004639] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-[#00614e]
              prose-strong:text-[#004639]
              prose-table:text-sm
              prose-th:bg-[#004639]/5 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
              prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-gray-100
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-blockquote:border-l-[#004639] prose-blockquote:bg-[#004639]/5 prose-blockquote:py-1 prose-blockquote:px-4
              prose-li:text-gray-700
              prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <div className="mt-16 p-8 bg-[#004639] rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">See what your bank is really charging you</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Upload your bank statement and get a free, instant breakdown of your hidden FX fees.
            </p>
            <Link
              href="/#tool"
              className="inline-block px-6 py-3 bg-white text-[#004639] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try the Free Audit Tool →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
