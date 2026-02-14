"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTaskStore } from "@/store/useTaskStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TaskDetailSkeleton } from "@/components/ui/skeletons";
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
import { useTask, invalidateTask } from "@/lib/hooks/useData";
import { getTaskStatus } from "@/lib/taskService";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Link2,
} from "lucide-react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const { submitSolution } = useTaskStore();

  // Use SWR hook for task data
  const { task, isLoading, error } = useTask(taskId);

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenSubmitModal = () => {
    setSubmissionLink("");
    setSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setSubmitModalOpen(false);
    setSubmissionLink("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !submissionLink.trim()) return;

    // Validate URL
    try {
      new URL(submissionLink);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setSubmitting(true);
    try {
      await submitSolution(task.id, submissionLink.trim());
      // Invalidate cache to refresh data
      await invalidateTask(taskId);
      toast.success("Solution submitted successfully!");
      handleCloseSubmitModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        err.response?.data?.error ||
        err.message ||
        "Failed to submit solution"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <TaskDetailSkeleton />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  Task not found
                </h2>
                <p className="text-muted-foreground mb-4">
                  The task you&apos;re looking for might not exist or you don&apos;t have permission to view it.
                </p>
                <Button variant="outline" onClick={() => router.push("/tasks")}>
                  Back to Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return null;
  }

  const status = getTaskStatus(task);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const submissionCount = task.userSubmissions?.length || 0;
  const latestSubmission = task.userSubmissions?.[0];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/tasks")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
          </div>

          {/* Task Content */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="space-y-4">
              {/* Points and Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  {task.points} pts
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}
                >
                  {status.label}
                </span>
                {isOverdue && status.canSubmit && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30">
                    Overdue
                  </span>
                )}
              </div>

              {/* Title */}
              <CardTitle className="text-3xl font-bold leading-tight text-white">
                {task.title}
              </CardTitle>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {task.dueDate && status.label !== "Completed" && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={isOverdue ? "text-red-400" : ""}>
                      Due: {new Date(task.dueDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {submissionCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>
                      {submissionCount}/2 attempt{submissionCount !== 1 ? "s" : ""} used
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description Section */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-400 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Latest Submission Info */}
              {latestSubmission && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Latest Submission
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {latestSubmission.status === "VERIFIED" && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {latestSubmission.status === "PENDING" && (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    {latestSubmission.status === "REJECTED" && (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${latestSubmission.status === "VERIFIED"
                        ? "text-green-400"
                        : latestSubmission.status === "PENDING"
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {latestSubmission.status === "VERIFIED"
                        ? `Verified (+${latestSubmission.points} pts)`
                        : latestSubmission.status === "PENDING"
                          ? "Awaiting verification"
                          : "Rejected"}
                    </span>
                  </div>
                  <a
                    href={latestSubmission.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {latestSubmission.link}
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(latestSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-700">
                {status.canSubmit && (
                  <Button
                    onClick={handleOpenSubmitModal}
                    size="lg"
                    className="gap-2"
                    variant={submissionCount > 0 ? "outline" : "default"}
                  >
                    <Send className="h-4 w-4" />
                    {submissionCount > 0 ? "Resubmit Solution" : "Submit Solution"}
                  </Button>
                )}

                {!status.canSubmit && status.label === "Completed" && (
                  <p className="text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    You have completed this task!
                  </p>
                )}

                {!status.canSubmit && status.label === "Pending Verification" && (
                  <p className="text-yellow-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Your submission is awaiting verification.
                  </p>
                )}

                {!status.canSubmit && status.label === "Max Attempts Reached" && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Maximum submission attempts reached.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Solution Modal */}
      {submitModalOpen && task && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">Submit Solution</CardTitle>
                  <CardDescription className="mt-1">
                    {task.title}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseSubmitModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-gray-800/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Trophy className="h-4 w-4 text-purple-400" />
                    <span>
                      <strong>{task.points} points</strong> upon verification
                    </span>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-gray-400 mt-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Due: {new Date(task.dueDate).toLocaleString()}
                        {new Date(task.dueDate) < new Date() && (
                          <span className="text-red-400 ml-2">(Late)</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Solution Link *</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://github.com/user/repo or drive link"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      className="bg-gray-800 border-gray-700 pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Provide a link to your solution (GitHub, Google Drive, etc.)
                  </p>
                </div>

                {/* Attempt Warning */}
                {submissionCount > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-400">
                      <p className="font-medium">This is your final attempt</p>
                      <p className="text-yellow-400/80">
                        You have already submitted once. You can only submit a
                        maximum of 2 times per task.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting || !submissionLink.trim()}
                    className="flex-1 gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Solution
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseSubmitModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
