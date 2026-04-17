import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPost, getAllBlogPosts } from "@/lib/blog/posts";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Yazi Bulunamadi" };

  return {
    title: `${post.title} - TahsilatCI Blog`,
    description: post.excerpt,
  };
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-6 text-gray-700">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="mb-3 mt-8 text-xl font-bold text-gray-900">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={key++}
          className="my-4 border-l-4 border-blue-500 bg-blue-50 py-3 pl-4 pr-3 text-gray-700 italic"
        >
          {trimmed.slice(2)}
        </blockquote>
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      flushList();
      elements.push(
        <p key={key++} className="my-2 font-semibold text-gray-900">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else {
      flushList();
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      elements.push(
        <p key={key++} className="my-2 leading-relaxed text-gray-700">
          {parts}
        </p>
      );
    }
  }

  flushList();
  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">TahsilatCI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/giris">
              <Button variant="ghost" size="sm">
                Giris Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Ucretsiz Dene
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Anasayfa
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{post.title}</span>
        </nav>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{post.author}</span>
              <span>{post.date}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>
          </header>

          <div className="prose-custom">{renderMarkdown(post.content)}</div>
        </article>

        <Card className="mt-12 overflow-hidden border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <h3 className="text-2xl font-bold">
              Siz de tahsilat oraninizi artirin
            </h3>
            <p className="max-w-md text-blue-100">
              TahsilatCI ile faturalarinizi takip edin, otomatik hatirlatmalar
              gonderin ve odeme oraninizi yukseltin.
            </p>
            <Link href="/kayit">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Ucretsiz Baslayin
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Tum yazilara don
          </Link>
        </div>
      </div>
    </div>
  );
}
