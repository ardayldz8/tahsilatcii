import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllBlogPosts } from "@/lib/blog/posts";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - TahsilatCI",
  description:
    "Esnaflar icin tahsilat, fatura yonetimi ve odeme takibi hakkinda faydali yazilar.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const [featured, ...rest] = posts;

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

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            TahsilatCI Blog
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Esnaflar icin tahsilat, fatura yonetimi ve is ipuclari
          </p>
        </div>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group mb-10 block">
            <Card className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <div className="flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/20 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-2 text-blue-100">{featured.excerpt}</p>
              </div>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:underline">
                  Devamini Oku
                  <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <Card className="h-full border-0 shadow-md transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="mt-2 text-lg group-hover:text-blue-600">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:underline">
                        Oku
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
