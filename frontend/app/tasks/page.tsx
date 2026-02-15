"use client";

import { useState } from "react";
import Link from "next/link";
import { useTaskStore } from "@/store/useTaskStore";
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
import { DashboardLayout } from "@/components/dashboard-layout";
import { TasksPageSkeleton } from "@/components/ui/skeletons";
import { useTasks, useUserPoints, invalidateTasks } from "@/lib/hooks/useData";
import {
  CheckSquare,
  Clock,
  Trophy,
  Link2,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getTaskStatus, verifyLeetCode } from "@/lib/taskService";
import type { Task } from "@/lib/hooks/useData";

type FilterType = "all" | "available" | "pending" | "completed";

export default function TasksPage() {
  // Use SWR hooks for tasks and points data
  const { tasks, isLoading } = useTasks();
  const { points: userPoints } = useUserPoints();

  // Keep mutation functions from Zustand store
  const { submitSolution } = useTaskStore();

  const [filter, setFilter] = useState<FilterType>("all");
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleOpenSubmitModal = (task: Task) => {
    setSelectedTask(task);
    setSubmissionLink("");
    setSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setSubmitModalOpen(false);
    setSelectedTask(null);
    setSubmissionLink("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !submissionLink.trim()) return;

    // Validate URL
    try {
      new URL(submissionLink);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setSubmitting(true);
    try {
      await submitSolution(selectedTask.id, submissionLink.trim());
      // Invalidate cache to refresh data
      await invalidateTasks();
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

  const handleVerifyLeetcode = async (task: Task) => {
    setVerifying(task.id);
    try {
      await verifyLeetCode(task.id);
      await invalidateTasks();
      toast.success("LeetCode submission verified! Points awarded.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        err.response?.data?.error ||
        err.message ||
        "Failed to verify LeetCode submission"
      );
    } finally {
      setVerifying(null);
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    const status = getTaskStatus(task);

    switch (filter) {
      case "available":
        return status.canSubmit && !task.userSubmissions?.length;
      case "pending":
        return task.userSubmissions?.some((s) => s.status === "PENDING");
      case "completed":
        return task.userSubmissions?.some((s) => s.status === "VERIFIED");
      default:
        return true;
    }
  });

  // Count tasks by category
  const taskCounts = {
    all: tasks.length,
    available: tasks.filter((t) => {
      const status = getTaskStatus(t);
      return status.canSubmit && !t.userSubmissions?.length;
    }).length,
    pending: tasks.filter((t) =>
      t.userSubmissions?.some((s) => s.status === "PENDING")
    ).length,
    completed: tasks.filter((t) =>
      t.userSubmissions?.some((s) => s.status === "VERIFIED")
    ).length,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <TasksPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <CheckSquare className="h-7 w-7 sm:h-8 sm:w-8" />
              Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete tasks to earn points
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">
              {userPoints} pts
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { id: "all", label: "All Tasks" },
                { id: "available", label: "Available" },
                { id: "pending", label: "Pending" },
                { id: "completed", label: "Completed" },
              ] as const
            ).map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.id)}
                className="gap-1"
              >
                {f.label}
                <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">
                  {taskCounts[f.id]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No tasks available yet"
                : `No ${filter} tasks`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => {
              const status = getTaskStatus(task);
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date();
              const submissionCount = task.userSubmissions?.length || 0;
              const latestSubmission = task.userSubmissions?.[0];

              return (
                <Card
                  key={task.id}
                  className="bg-card border-border hover:border-border transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-foreground text-lg line-clamp-1">
                        {task.title}
                      </CardTitle>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-semibold whitespace-nowrap">
                        {task.points} pts
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {isOverdue && status.canSubmit && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                          Overdue
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {task.description}
                      </p>
                    )}

                    {/* LeetCode Badge */}
                    {task.leetcodeSlug && (
                      <a
                        href={`https://leetcode.com/problems/${task.leetcodeSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-md text-xs hover:bg-orange-500/25 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Solve on LeetCode
                      </a>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
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
                            {submissionCount}/2 attempt
                            {submissionCount !== 1 ? "s" : ""} used
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Latest Submission Info */}
                    {latestSubmission && (
                      <div className="p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          {latestSubmission.status === "VERIFIED" && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                          {latestSubmission.status === "PENDING" && (
                            <Clock className="h-4 w-4 text-yellow-400" />
                          )}
                          {latestSubmission.status === "REJECTED" && (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span
                            className={`text-xs font-medium ${latestSubmission.status === "VERIFIED"
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
                          className="text-xs text-blue-400 hover:underline truncate block"
                        >
                          {latestSubmission.link}
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Link href={`/tasks/${task.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>

                      {status.canSubmit && task.leetcodeSlug && (
                        <Button
                          onClick={() => handleVerifyLeetcode(task)}
                          size="sm"
                          disabled={verifying === task.id}
                          className="gap-2 bg-orange-600 hover:bg-orange-700"
                        >
                          {verifying === task.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Verify
                            </>
                          )}
                        </Button>
                      )}
                      {status.canSubmit && !task.leetcodeSlug && (
                        <Button
                          onClick={() => handleOpenSubmitModal(task)}
                          size="sm"
                          className="gap-2"
                          variant={submissionCount > 0 ? "outline" : "default"}
                        >
                          <Send className="h-4 w-4" />
                          {submissionCount > 0 ? "Resubmit" : "Submit"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Solution Modal */}
      {submitModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border w-full max-w-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">Submit Solution</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedTask.title}
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
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-purple-400" />
                    <span>
                      <strong>{selectedTask.points} points</strong> upon
                      verification
                    </span>
                  </div>
                  {selectedTask.dueDate && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Due: {new Date(selectedTask.dueDate).toLocaleString()}
                        {new Date(selectedTask.dueDate) < new Date() && (
                          <span className="text-red-400 ml-2">(Late)</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Solution Link *</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://github.com/user/repo or drive link"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      className="bg-muted border-border pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide a link to your solution (GitHub, Google Drive, etc.)
                  </p>
                </div>

                {/* Attempt Warning */}
                {(selectedTask.userSubmissions?.length || 0) > 0 && (
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
