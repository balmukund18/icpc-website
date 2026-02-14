"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "@/components/ui/card";
import { BlogContent } from "@/components/rich-text-editor";
import {
  ArrowLeft,
  User,
  Clock,
  Tag,
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function BlogViewPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const {
    currentBlog,
    currentBlogLoading,
    currentBlogError,
    fetchBlog,
    clearCurrentBlog,
    addComment,
    editComment,
    deleteComment,
    deleteBlog,
  } = useBlogStore();

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [deletingBlog, setDeletingBlog] = useState(false);

  // Fetch blog on mount
  useEffect(() => {
    if (isAuthenticated && hasHydrated && blogId) {
      fetchBlog(blogId);
    }
    return () => clearCurrentBlog();
  }, [isAuthenticated, hasHydrated, blogId, fetchBlog, clearCurrentBlog]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await addComment(blogId, newComment.trim());
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    try {
      await editComment(blogId, commentId, editingCommentContent.trim());
      setEditingCommentId(null);
      setEditingCommentContent("");
      toast.success("Comment updated successfully");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(blogId, commentId);
      toast.success("Comment deleted successfully");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleDeleteBlog = async () => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    setDeletingBlog(true);
    try {
      await deleteBlog(blogId);
      toast.success("Blog deleted successfully");
      router.push("/blog");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete blog");
      setDeletingBlog(false);
    }
  };

  const isAuthor = currentBlog?.authorId === user?.id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAuthor && currentBlog?.status !== "APPROVED";
  const canDelete = isAuthor || isAdmin;

  if (currentBlogLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (currentBlogError) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  {currentBlogError}
                </h2>
                <p className="text-muted-foreground mb-4">
                  The blog you&apos;re looking for might not exist or you don&apos;t have permission to view it.
                </p>
                <Link href="/blog">
                  <Button variant="outline">Back to Blogs</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentBlog) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/blog")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
            {(canEdit || canDelete) && (
              <div className="flex gap-2">
                {canEdit && (
                  <Link href={`/blog/edit/${blogId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDeleteBlog}
                    disabled={deletingBlog}
                  >
                    {deletingBlog ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Blog Content */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader className="space-y-4">
              {/* Status Badge (for author viewing own blog) */}
              {isAuthor && currentBlog.status !== "APPROVED" && (
                <div
                  className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-medium ${currentBlog.status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                >
                  {currentBlog.status === "PENDING"
                    ? "Pending Approval"
                    : "Rejected"}
                </div>
              )}

              {/* Rejection Reason */}
              {isAuthor && currentBlog.status === "REJECTED" && currentBlog.rejectionReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    <strong>Rejection Reason:</strong> {currentBlog.rejectionReason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can edit your blog and resubmit for approval.
                  </p>
                </div>
              )}

              <CardTitle className="text-3xl font-bold leading-tight">
                {currentBlog.title}
              </CardTitle>

              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {currentBlog.author.name}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10">
                    {currentBlog.author.role}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(currentBlog.createdAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {currentBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentBlog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-white/10 text-white/80"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="border-t border-white/10 pt-6">
                <BlogContent content={currentBlog.content} />
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({currentBlog.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Comment Form */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="gap-2"
                    >
                      {submittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {currentBlog.comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  {currentBlog.comments.map((comment) => {
                    const isCommentOwner = comment.userId === user?.id;
                    const canEditComment = isCommentOwner;
                    const canDeleteComment = isCommentOwner || isAdmin;
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 p-4 bg-white/5 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.user.name}
                            </span>
                            {comment.isEdited && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                edited
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingCommentContent}
                                onChange={(e) =>
                                  setEditingCommentContent(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={!editingCommentContent.trim()}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentContent("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-foreground/90">
                                {comment.content}
                              </p>
                              {(canEditComment || canDeleteComment) && (
                                <div className="flex gap-2 mt-2">
                                  {canEditComment && (
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingCommentContent(comment.content);
                                      }}
                                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  {canDeleteComment && (
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
