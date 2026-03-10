import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: number;
  content: string;
  htmlContent?: string;
}

function calculateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
      author: data.author ?? "Loop Financial",
      readTime: calculateReadTime(content),
      content,
    };
  });
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost & { htmlContent: string }> {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);
  const result = await remark().use(remarkGfm).use(html, { sanitize: false }).process(content);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    author: data.author ?? "Loop Financial",
    readTime: calculateReadTime(content),
    content,
    htmlContent: result.toString(),
  };
}
