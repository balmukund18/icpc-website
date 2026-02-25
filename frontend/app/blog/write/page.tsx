"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function WriteBlogPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const { createBlog, tags, fetchTags } = useBlogStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role check
  useEffect(() => {
    if (!hasHydrated) return;
    if (user?.role !== "STUDENT" && user?.role !== "ALUMNI" && user?.role !== "ADMIN") {
      toast.error("Only students, alumni, and admins can write blogs");
      router.push("/blog");
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    if (isAuthenticated && hasHydrated) { fetchTags(); }
  }, [isAuthenticated, hasHydrated, fetchTags]);

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
      await createBlog({ title: title.trim(), content, tags: selectedTags });
      toast.success("Blog submitted for approval!");
      router.push("/blog/my");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create blog");
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
              <span className="font-normal text-muted-foreground">--write</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              share your knowledge with the community
            </p>
          </div>
          <button
            onClick={() => router.push("/blog")}
            className="text-xs border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            ← BACK
          </button>
        </section>

        <hr className="border-border" />

        {/* Info Banner */}
        <section className="py-4">
          <div className="text-sm border border-[#D29922]/30 p-3">
            <span className="text-[#D29922]">[INFO]</span>{" "}
            <span className="text-muted-foreground">
              your blog will be reviewed by an admin before publishing. you&apos;ll be notified once approved or if changes are requested.
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
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your blog content here... Share your experiences, tutorials, tips, or insights!"
            minHeight="350px"
          />
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
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border border-[#58A6FF]/30 text-[#58A6FF]"
                >
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
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-xs border transition-colors ${selectedTags.includes(tag)
                  ? "border-[#58A6FF]/30 text-[#58A6FF]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
              >
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
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              [ ADD ]
            </button>
          </div>
        </section>

        <hr className="border-border" />

        {/* Submit */}
        <section className="py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={() => router.push("/blog")}
            className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> submitting...</>
            ) : (
              "[ SUBMIT FOR APPROVAL ]"
            )}
          </button>
        </section>

      </div>
    </DashboardLayout>
  );
}
