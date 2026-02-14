"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PenSquare,
  User,
  Clock,
  Tag,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function BlogListingPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const {
    blogs,
    blogsLoading,
    blogsError,
    hasMoreBlogs,
    selectedTag,
    tags,
    tagsLoading,
    fetchBlogs,
    loadMoreBlogs,
    setSelectedTag,
    fetchTags,
  } = useBlogStore();

  // Fetch blogs and tags on mount
  useEffect(() => {
    if (isAuthenticated && hasHydrated) {
      fetchBlogs(1, null);
      fetchTags();
    }
  }, [isAuthenticated, hasHydrated, fetchBlogs, fetchTags]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
                Blog
              </h1>
              <p className="text-muted-foreground mt-1">
                Insights and articles from our community
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/blog/my">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  My Blogs
                </Button>
              </Link>
              {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
                <Link href="/blog/write">
                  <Button className="gap-2">
                    <PenSquare className="h-4 w-4" />
                    Write Blog
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Filter by Tag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  className="rounded-full"
                >
                  All
                </Button>
                {tagsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  tags?.all.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className="rounded-full"
                    >
                      {tag}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blog Grid */}
          {blogsLoading && blogs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blogsError ? (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-8 text-center">
                <p className="text-red-400">{blogsError}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchBlogs(1, selectedTag)}
                  className="mt-4"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : blogs.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTag
                    ? `No blogs found with tag "${selectedTag}"`
                    : "Be the first to share your knowledge!"}
                </p>
                {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
                  <Link href="/blog/write">
                    <Button className="gap-2">
                      <PenSquare className="h-4 w-4" />
                      Write the first blog
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.id}`}>
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full group cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <User className="h-3 w-3" />
                          <span>{blog.author.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {truncateText(stripHtml(blog.content), 150)}
                        </p>
                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                +{blog.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              {hasMoreBlogs && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreBlogs}
                    disabled={blogsLoading}
                    className="gap-2"
                  >
                    {blogsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
