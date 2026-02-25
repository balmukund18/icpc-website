"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import {
  PenSquare,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function MyBlogsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const {
    myBlogs,
    myBlogsLoading,
    myBlogsError,
    fetchMyBlogs,
    deleteBlog,
  } = useBlogStore();

  useEffect(() => {
    if (isAuthenticated && hasHydrated) { fetchMyBlogs(); }
  }, [isAuthenticated, hasHydrated, fetchMyBlogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    try {
      await deleteBlog(blogId);
      toast.success("Blog deleted successfully");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete blog");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { label: "approved", prefix: "[✓]", color: "#3FB950", borderColor: "#3FB950" };
      case "REJECTED":
        return { label: "rejected", prefix: "[✗]", color: "#F85149", borderColor: "#F85149" };
      default:
        return { label: "pending", prefix: "[~]", color: "#D29922", borderColor: "#D29922" };
    }
  };

  const pendingCount = myBlogs.filter((b) => b.status === "PENDING").length;
  const approvedCount = myBlogs.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = myBlogs.filter((b) => b.status === "REJECTED").length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              &gt; <span className="font-bold">blog</span>{" "}
              <span className="font-normal text-muted-foreground">--my-posts</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              manage your blog posts
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/blog")}
              className="text-xs border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              ← BACK
            </button>
            {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
              <Link href="/blog/write">
                <button className="text-xs border border-foreground px-3 py-1.5 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5">
                  <PenSquare className="h-3.5 w-3.5" /> WRITE
                </button>
              </Link>
            )}
          </div>
        </section>

        <hr className="border-border" />

        {/* Stats */}
        <section className="py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span>
              <span className="text-[#D29922]">[~]</span>{" "}
              <span className="text-muted-foreground">pending: </span>
              <span className="text-foreground font-semibold">{pendingCount}</span>
            </span>
            <span>
              <span className="text-[#3FB950]">[✓]</span>{" "}
              <span className="text-muted-foreground">approved: </span>
              <span className="text-foreground font-semibold">{approvedCount}</span>
            </span>
            <span>
              <span className="text-[#F85149]">[✗]</span>{" "}
              <span className="text-muted-foreground">rejected: </span>
              <span className="text-foreground font-semibold">{rejectedCount}</span>
            </span>
          </div>
        </section>

        <hr className="border-border" />

        {/* Blog List */}
        {myBlogsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : myBlogsError ? (
          <div className="text-sm text-[#F85149] border border-[#F85149]/30 p-3 my-4">
            &gt; error: {myBlogsError}
            <button onClick={fetchMyBlogs} className="ml-4 text-xs underline">retry</button>
          </div>
        ) : myBlogs.length === 0 ? (
          <section className="py-10 text-center border border-border my-4">
            <p className="text-foreground font-semibold mb-1">&gt; no blogs yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              start sharing your knowledge with the community
            </p>
            {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
              <Link href="/blog/write">
                <button className="text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-2">
                  <PenSquare className="h-4 w-4" /> [ WRITE YOUR FIRST BLOG ]
                </button>
              </Link>
            )}
          </section>
        ) : (
          <section className="py-2">
            {myBlogs.map((blog, i) => {
              const statusBadge = getStatusBadge(blog.status);
              const canEdit = blog.status !== "APPROVED";

              return (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.25 }}
                  className="py-4 border-b border-border/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status + Date */}
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="text-xs px-2 py-0.5 border inline-flex items-center gap-1"
                          style={{ color: statusBadge.color, borderColor: statusBadge.borderColor + "30" }}
                        >
                          {statusBadge.prefix} {statusBadge.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(blog.createdAt)}</span>
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${blog.id}`} className="hover:underline">
                        <p className="font-semibold text-foreground text-base">{blog.title}</p>
                      </Link>

                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {blog.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 border border-border text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 4 && (
                            <span className="text-xs px-2 py-0.5 text-muted-foreground">+{blog.tags.length - 4}</span>
                          )}
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {blog.status === "REJECTED" && blog.rejectionReason && (
                        <div className="text-sm border border-[#F85149]/30 p-2 mt-3">
                          <span className="text-[#F85149] text-xs">[REJECTED]</span>{" "}
                          <span className="text-muted-foreground text-xs">{blog.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/blog/${blog.id}`}>
                        <button className="text-xs border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                          VIEW
                        </button>
                      </Link>
                      {canEdit && (
                        <Link href={`/blog/edit/${blog.id}`}>
                          <button className="text-xs border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                            EDIT
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-xs border border-border px-3 py-1 text-muted-foreground hover:text-[#F85149] hover:border-[#F85149]/30 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
