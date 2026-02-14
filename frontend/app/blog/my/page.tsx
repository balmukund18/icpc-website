"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeft,
  PenSquare,
  Clock,
  FileText,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
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

  // Fetch blogs on mount
  useEffect(() => {
    if (isAuthenticated && hasHydrated) {
      fetchMyBlogs();
    }
  }, [isAuthenticated, hasHydrated, fetchMyBlogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          label: "Approved",
          className: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          label: "Rejected",
          className: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      default:
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
    }
  };

  const pendingCount = myBlogs.filter((b) => b.status === "PENDING").length;
  const approvedCount = myBlogs.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = myBlogs.filter((b) => b.status === "REJECTED").length;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/blog")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">
                  My Blogs
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your blog posts
                </p>
              </div>
            </div>
            {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
              <Link href="/blog/write">
                <Button className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  Write New Blog
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {approvedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {rejectedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Need Revision</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog List */}
          {myBlogsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myBlogsError ? (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-8 text-center">
                <p className="text-red-400">{myBlogsError}</p>
                <Button
                  variant="outline"
                  onClick={fetchMyBlogs}
                  className="mt-4"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : myBlogs.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t written any blogs yet. Start sharing your knowledge!
                </p>
                {(user?.role === "STUDENT" || user?.role === "ALUMNI" || user?.role === "ADMIN") && (
                  <Link href="/blog/write">
                    <Button className="gap-2">
                      <PenSquare className="h-4 w-4" />
                      Write your first blog
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBlogs.map((blog) => {
                const statusConfig = getStatusConfig(blog.status);
                const StatusIcon = statusConfig.icon;
                const canEdit = blog.status !== "APPROVED";

                return (
                  <Card
                    key={blog.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status Badge */}
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusConfig.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold mb-2 truncate">
                            {blog.title}
                          </h3>

                          {/* Tags */}
                          {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {blog.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70"
                                >
                                  {tag}
                                </span>
                              ))}
                              {blog.tags.length > 4 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                                  +{blog.tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {blog.status === "REJECTED" && blog.rejectionReason && (
                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mt-3">
                              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-red-400">
                                  Rejection Reason:
                                </p>
                                <p className="text-red-300/80">
                                  {blog.rejectionReason}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/blog/${blog.id}`}>
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canEdit && (
                            <Link href={`/blog/edit/${blog.id}`}>
                              <Button variant="ghost" size="icon" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(blog.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
