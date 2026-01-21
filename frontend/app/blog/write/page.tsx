"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Loader2,
  X,
  Plus,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// Dynamic import for the editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-white/5 rounded-2xl flex items-center justify-center">
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

  // Role check - only students, alumni, and admins can write blogs
  useEffect(() => {
    if (!hasHydrated) return;
    if (user?.role !== "STUDENT" && user?.role !== "ALUMNI" && user?.role !== "ADMIN") {
      toast.error("Only students, alumni, and admins can write blogs");
      router.push("/blog");
    }
  }, [hasHydrated, user, router]);

  // Fetch tags on mount
  useEffect(() => {
    if (isAuthenticated && hasHydrated) {
      fetchTags();
    }
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
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Please write some content");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBlog({
        title: title.trim(),
        content,
        tags: selectedTags,
      });
      toast.success("Blog submitted for approval!");
      router.push("/blog/my");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
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
                Write a Blog
              </h1>
              <p className="text-muted-foreground mt-1">
                Share your knowledge with the community
              </p>
            </div>
          </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Approval Required</p>
            <p className="text-blue-300/80">
              Your blog will be reviewed by an admin before it&apos;s published.
              You&apos;ll be notified once it&apos;s approved or if changes are requested.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your blog"
                className="bg-white/5 border-white/10 focus:border-primary"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/200
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your blog content here... Share your experiences, tutorials, tips, or insights!"
                minHeight="350px"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <p className="text-xs text-muted-foreground">
                Select relevant tags or add custom ones
              </p>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-primary/20 text-primary border border-primary/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
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
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/5 text-white/70 border border-white/10 hover:border-white/30"
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
                  placeholder="Add a custom tag"
                  className="bg-white/5 border-white/10 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/blog")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit for Approval
          </Button>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
