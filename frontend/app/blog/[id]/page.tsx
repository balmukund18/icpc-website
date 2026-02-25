"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BlogContent } from "@/components/rich-text-editor";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleBlogLike, getBlogLikeStatus } from "@/lib/blogService";
import { motion } from "framer-motion";

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
  const [likeCount, setLikeCount] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasHydrated && blogId) {
      fetchBlog(blogId);
    }
    return () => clearCurrentBlog();
  }, [isAuthenticated, hasHydrated, blogId, fetchBlog, clearCurrentBlog]);

  useEffect(() => {
    if (isAuthenticated && hasHydrated && blogId) {
      getBlogLikeStatus(blogId)
        .then((status) => {
          setLikeCount(status.count);
          setUserHasLiked(status.userHasLiked);
        })
        .catch(() => { });
    }
  }, [isAuthenticated, hasHydrated, blogId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await addComment(blogId, newComment.trim());
      setNewComment("");
      toast.success("Comment added");
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
      toast.success("Comment updated");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(blogId, commentId);
      toast.success("Comment deleted");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleDeleteBlog = async () => {
    if (!confirm("Delete this blog? This cannot be undone.")) return;
    setDeletingBlog(true);
    try {
      await deleteBlog(blogId);
      toast.success("Blog deleted");
      router.push("/blog");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete blog");
      setDeletingBlog(false);
    }
  };

  const handleToggleLike = async () => {
    if (likingInProgress) return;
    setLikingInProgress(true);
    try {
      const result = await toggleBlogLike(blogId);
      setLikeCount(result.count);
      setUserHasLiked(result.userHasLiked);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle like");
    } finally {
      setLikingInProgress(false);
    }
  };

  const isAuthor = currentBlog?.authorId === user?.id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAuthor && currentBlog?.status !== "APPROVED";
  const canDelete = isAuthor || isAdmin;

  // Loading
  if (currentBlogLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Error
  if (currentBlogError) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="border border-[#F85149]/30 p-6">
            <p className="text-sm text-[#F85149] mb-4">
              &gt; error: {currentBlogError}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              the blog you&apos;re looking for might not exist or you don&apos;t have permission to view it.
            </p>
            <Link href="/blog">
              <button className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                [ BACK TO BLOGS ]
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentBlog) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/blog")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← back
            </button>
            {(canEdit || canDelete) && (
              <div className="flex gap-2">
                {canEdit && (
                  <Link href={`/blog/edit/${blogId}`}>
                    <button className="text-xs border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition-colors">
                      [ EDIT ]
                    </button>
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteBlog}
                    disabled={deletingBlog}
                    className="text-xs border border-[#F85149]/40 px-3 py-1 text-[#F85149] hover:bg-[#F85149]/10 transition-colors disabled:opacity-50"
                  >
                    {deletingBlog ? "deleting..." : "[ DELETE ]"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Status Banners ── */}
          {isAuthor && currentBlog.status === "PENDING" && (
            <div className="border-l-2 border-[#D29922] pl-3 py-2 mb-4">
              <p className="text-sm text-[#D29922]">[PENDING] awaiting admin approval</p>
            </div>
          )}

          {isAuthor && currentBlog.status === "REJECTED" && (
            <div className="border-l-2 border-[#F85149] pl-3 py-2 mb-4 space-y-1">
              <p className="text-sm text-[#F85149]">[REJECTED] this blog was not approved</p>
              {currentBlog.rejectionReason && (
                <p className="text-xs text-muted-foreground">reason: {currentBlog.rejectionReason}</p>
              )}
              <p className="text-xs text-muted-foreground">you can edit and resubmit</p>
            </div>
          )}

          {/* ── Title ── */}
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
            {currentBlog.title}
          </h1>

          {/* ── Meta ── */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
            <span>by <span className="text-foreground">{currentBlog.author.name}</span></span>
            <span>·</span>
            <span>{formatDate(currentBlog.createdAt)}</span>
            <span>·</span>
            <span className="text-xs px-1.5 py-0.5 border border-border">{currentBlog.author.role}</span>
          </div>

          {/* ── Tags ── */}
          {currentBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {currentBlog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <hr className="border-border mb-6" />

          {/* ── Blog Content ── */}
          <div className="prose prose-invert max-w-none mb-6">
            <BlogContent content={currentBlog.content} />
          </div>

          <hr className="border-border" />

          {/* ── Upvote Bar ── */}
          <div className="flex items-center gap-4 py-3">
            <button
              onClick={handleToggleLike}
              disabled={likingInProgress}
              className={`text-sm border px-4 py-1.5 transition-colors inline-flex items-center gap-2 ${userHasLiked
                  ? "border-[#3FB950] text-[#3FB950] bg-[#3FB950]/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
            >
              {userHasLiked ? "▼" : "▲"} {userHasLiked ? "UPVOTED" : "UPVOTE"}
            </button>
            <span className="text-sm text-muted-foreground">{likeCount} upvotes</span>
          </div>

          <hr className="border-border" />

          {/* ── Comments ── */}
          <section className="py-4">
            <p className="text-sm font-semibold text-foreground mb-4">
              &gt; comments ({currentBlog.comments.length})
            </p>

            {/* New Comment */}
            <div className="flex gap-2 mb-6">
              <span className="text-muted-foreground text-sm mt-2 select-none">&gt;</span>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="write a comment..."
                  className="w-full px-3 py-2 bg-transparent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="text-xs border border-border px-4 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-40"
                  >
                    {submittingComment ? "posting..." : "[ POST ]"}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {currentBlog.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">no comments yet — be the first!</p>
            ) : (
              <div className="space-y-0">
                {currentBlog.comments.map((comment, i) => {
                  const isCommentOwner = comment.userId === user?.id;
                  const canEditComment = isCommentOwner;
                  const canDeleteComment = isCommentOwner || isAdmin;
                  const isEditing = editingCommentId === comment.id;

                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.2 }}
                      className="py-3 border-b border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="text-foreground font-medium">{comment.user.name}</span>
                        {comment.isEdited && (
                          <span className="text-[#58A6FF]">(edited)</span>
                        )}
                        <span className="text-[#484F58] ml-auto">{formatDate(comment.createdAt)}</span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent border border-border text-sm text-foreground focus:outline-none focus:border-foreground resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editingCommentContent.trim()}
                              className="text-xs border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                            >
                              [ SAVE ]
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent("");
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                          {(canEditComment || canDeleteComment) && (
                            <div className="flex gap-3 mt-2">
                              {canEditComment && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentContent(comment.content);
                                  }}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  edit
                                </button>
                              )}
                              {canDeleteComment && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-xs text-[#F85149] hover:text-[#FF6B6B] transition-colors"
                                >
                                  delete
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

        </motion.div>
      </div>
    </DashboardLayout>
  );
}
