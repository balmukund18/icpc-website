"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/useAuthStore";
import { useBlogStore } from "@/store/useBlogStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Dynamic import for the editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] border border-border flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function EditBlogPage() {
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
    updateBlog,
    clearCurrentBlog,
    tags,
    fetchTags,
  } = useBlogStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasHydrated && blogId) {
      fetchBlog(blogId);
      fetchTags();
    }
    return () => clearCurrentBlog();
  }, [isAuthenticated, hasHydrated, blogId, fetchBlog, fetchTags, clearCurrentBlog]);

  useEffect(() => {
    if (currentBlog && !initialized) {
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
      setSelectedTags(currentBlog.tags || []);
      setInitialized(true);
    }
  }, [currentBlog, initialized]);

  // Check authorization
  useEffect(() => {
    if (currentBlog && user) {
      const isAuthor = currentBlog.authorId === user.id;
      const canEdit = isAuthor && currentBlog.status !== "APPROVED";
      if (!canEdit) { toast.error("You cannot edit this blog"); router.push("/blog"); }
    }
  }, [currentBlog, user, router]);

  if (currentBlogLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (currentBlogError) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-sm text-[#F85149] border border-[#F85149]/30 p-4">
            <p>&gt; error: {currentBlogError}</p>
            <button onClick={() => router.push("/blog/my")}
              className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors mt-3">
              ← BACK TO MY BLOGS
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentBlog) return null;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    if (!content.trim() || content === "<p></p>") { toast.error("Please write some content"); return; }

    setIsSubmitting(true);
    try {
      await updateBlog(blogId, { title: title.trim(), content, tags: selectedTags });
      toast.success("Blog updated and resubmitted for approval!");
      router.push("/blog/my");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update blog");
    } finally { setIsSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              &gt; <span className="font-bold">blog</span>{" "}
              <span className="font-normal text-muted-foreground">--edit</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              update your blog post
            </p>
          </div>
          <button
            onClick={() => router.push("/blog/my")}
            className="text-xs border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            ← BACK
          </button>
        </section>

        <hr className="border-border" />

        {/* Rejection Reason Banner */}
        {currentBlog.status === "REJECTED" && currentBlog.rejectionReason && (
          <section className="py-4">
            <div className="text-sm border border-[#F85149]/30 p-3">
              <span className="text-[#F85149]">[REJECTED]</span>{" "}
              <span className="text-muted-foreground">{currentBlog.rejectionReason}</span>
              <p className="text-xs text-[#484F58] mt-1">
                please address the feedback above and resubmit
              </p>
            </div>
          </section>
        )}

        {/* Info Banner */}
        <section className="py-4">
          <div className="text-sm border border-[#D29922]/30 p-3">
            <span className="text-[#D29922]">[INFO]</span>{" "}
            <span className="text-muted-foreground">
              after saving, your blog will be resubmitted for admin approval.
            </span>
          </div>
        </section>

        <hr className="border-border" />

        {/* Title */}
        <section className="py-4 space-y-2">
          <Label htmlFor="title" className="text-sm text-muted-foreground">&gt; title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="enter an engaging title for your blog"
            className="bg-background border-border"
            maxLength={200}
          />
          <p className="text-xs text-[#484F58] text-right">{title.length}/200</p>
        </section>

        {/* Content */}
        <section className="py-4 space-y-2">
          <Label className="text-sm text-muted-foreground">&gt; content *</Label>
          {initialized && (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
              minHeight="350px"
            />
          )}
        </section>

        <hr className="border-border" />

        {/* Tags */}
        <section className="py-4 space-y-3">
          <Label className="text-sm text-muted-foreground">&gt; tags</Label>
          <p className="text-xs text-[#484F58]">select relevant tags or add custom ones</p>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <span key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border border-[#58A6FF]/30 text-[#58A6FF]">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[#F85149] transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Predefined Tags */}
          <div className="flex flex-wrap gap-2">
            {tags?.predefined.map((tag) => (
              <button key={tag} type="button" onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-xs border transition-colors ${selectedTags.includes(tag)
                    ? "border-[#58A6FF]/30 text-[#58A6FF]"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 mt-3">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="add a custom tag"
              className="bg-background border-border flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleAddCustomTag(); }
              }}
            />
            <button type="button" onClick={handleAddCustomTag} disabled={!customTag.trim()}
              className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors disabled:opacity-50">
              [ ADD ]
            </button>
          </div>
        </section>

        <hr className="border-border" />

        {/* Submit */}
        <section className="py-4 flex justify-end gap-3">
          <button onClick={() => router.push("/blog/my")}
            className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
            cancel
          </button>
          <button onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> saving...</>
            ) : (
              "[ SAVE & RESUBMIT ]"
            )}
          </button>
        </section>

      </div>
    </DashboardLayout>
  );
}
