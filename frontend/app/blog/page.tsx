"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  PenSquare,
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

  useEffect(() => {
    if (isAuthenticated && hasHydrated) {
      fetchBlogs(1, null);
      fetchTags();
    }
  }, [isAuthenticated, hasHydrated, fetchBlogs, fetchTags]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
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

  const getReadTime = (html: string) => {
    const text = stripHtml(html);
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Find trending tags (top 3 by usage frequency)
  const trendingTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    blogs.forEach((b) => b.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  }, [blogs]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              &gt; <span className="font-bold">blog</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Insights and articles from our community
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog/my">
              <button className="text-xs border border-border px-3 py-2 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> MY BLOGS
              </button>
            </Link>
            {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
              <Link href="/blog/write">
                <button className="text-xs border border-foreground px-3 py-2 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5">
                  <PenSquare className="h-3.5 w-3.5" /> Write Blog
                </button>
              </Link>
            )}
          </div>
        </section>

        <hr className="border-border" />

        {/* Tags Filter */}
        <section className="py-4 border border-border p-4">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            ◇ Filter by tag:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 text-xs border transition-colors ${selectedTag === null
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              All
            </button>
            {tagsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              tags?.all.map((tag) => {
                const isTrending = trendingTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 text-xs border transition-colors ${selectedTag === tag
                      ? "border-foreground text-foreground"
                      : isTrending
                        ? "border-[#D29922]/40 text-[#D29922] hover:text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tag}{isTrending && " 🔥"}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Blogs */}
        {blogsLoading && blogs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : blogsError ? (
          <div className="text-sm text-[#FF4D4F] border border-[#FF4D4F]/30 p-3 my-4">
            &gt; error: {blogsError}
            <button onClick={() => fetchBlogs(1, selectedTag)} className="ml-4 text-xs underline">
              retry
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <section className="py-8 border border-border p-8 text-center my-4">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold mb-1">No blogs yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTag
                ? `> no blogs found with tag "${selectedTag}"`
                : "> be the first to share your knowledge!"}
            </p>
            {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
              <Link href="/blog/write">
                <button className="text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-2">
                  <PenSquare className="h-4 w-4" /> [ WRITE THE FIRST BLOG ]
                </button>
              </Link>
            )}
          </section>
        ) : (
          <section className="py-4">
            {blogs.map((blog, i) => (
              <Link key={blog.id} href={`/blog/${blog.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.25 }}
                  className="py-4 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground hover:underline">
                        {blog.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {blog.author.name} · {formatDate(blog.createdAt)} · <span className="text-[#8B949E]">{getReadTime(blog.content)} min read</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {truncateText(stripHtml(blog.content), 180)}
                      </p>
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {blog.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className={`text-xs px-2 py-0.5 border ${trendingTags.includes(tag) ? "border-[#D29922]/30 text-[#D29922]" : "border-border text-muted-foreground"}`}>
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 4 && (
                            <span className="text-xs px-2 py-0.5 text-muted-foreground">
                              +{blog.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span title="Upvotes">▲ {blog._count?.likes ?? 0}</span>
                      <span title="Comments">💬 {blog._count?.comments ?? 0}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* Load More */}
            {hasMoreBlogs && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreBlogs}
                  disabled={blogsLoading}
                  className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {blogsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  [ LOAD MORE ]
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
