import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog — FX Insights for Canadian Businesses",
  description:
    "Expert insights on foreign exchange costs, hidden bank fees, and how Canadian businesses can save on FX. From Loop Financial.",
  openGraph: {
    title: "Blog — FX Insights for Canadian Businesses",
    description:
      "Expert insights on foreign exchange costs, hidden bank fees, and how Canadian businesses can save on FX.",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-[#004639] mb-2">Blog</h1>
          <p className="text-lg text-gray-500 mb-12">
            Insights on FX costs, hidden bank fees, and smarter currency management for Canadian businesses.
          </p>

          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group border border-gray-200 rounded-xl p-6 hover:border-[#004639]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date + "T00:00:00").toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                </div>
                <h2 className="text-xl font-semibold text-[#004639] group-hover:text-[#00614e] transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 leading-relaxed line-clamp-2">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
