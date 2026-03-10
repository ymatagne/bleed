import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        authors: [post.author],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPost({ params }: { params: Params }) {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white pt-20">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <Link href="/blog" className="text-sm text-[#004639]/60 hover:text-[#004639] transition-colors mb-8 inline-block">
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <time dateTime={post.date}>
              {new Date(post.date + "T00:00:00").toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>{post.author}</span>
          </div>

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
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

          {/* CTA */}
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
