"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTaskStore } from "@/store/useTaskStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TaskDetailSkeleton } from "@/components/ui/skeletons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTask, invalidateTask } from "@/lib/hooks/useData";
import { getTaskStatus } from "@/lib/taskService";
import {
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { submitSolution } = useTaskStore();
  const { task, isLoading, error } = useTask(taskId);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenSubmitModal = () => { setSubmissionLink(""); setSubmitModalOpen(true); };
  const handleCloseSubmitModal = () => { setSubmitModalOpen(false); setSubmissionLink(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !submissionLink.trim()) return;
    try { new URL(submissionLink); } catch { toast.error("Please enter a valid URL"); return; }
    setSubmitting(true);
    try {
      await submitSolution(task.id, submissionLink.trim());
      await invalidateTask(taskId);
      toast.success("Solution submitted successfully!");
      handleCloseSubmitModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err.response?.data?.error || err.message || "Failed to submit solution");
    } finally { setSubmitting(false); }
  };

  if (isLoading) return (<DashboardLayout><TaskDetailSkeleton /></DashboardLayout>);

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-sm text-[#FF4D4F] border border-[#FF4D4F]/30 p-4">
            <p>&gt; error: task not found</p>
            <button onClick={() => router.push("/tasks")} className="text-xs underline mt-2 text-muted-foreground">
              ← back to tasks
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = getTaskStatus(task);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const submissionCount = task.userSubmissions?.length || 0;
  const latestSubmission = task.userSubmissions?.[0];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Back + Header */}
        <section className="py-2">
          <button onClick={() => router.push("/tasks")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← back to tasks
          </button>
        </section>

        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">task</span>{" "}
            <span className="font-normal text-muted-foreground">--detail</span>
          </h1>
        </section>

        <hr className="border-border" />

        {/* Task info */}
        <section className="py-4 space-y-3">
          <p className="text-lg font-semibold text-foreground">{task.title}</p>

          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">points: </span><span className="text-foreground font-semibold">{task.points} pts</span></p>
            <p><span className="text-muted-foreground">status: </span><span className={`${status.label === "Completed" ? "text-[#3FB950]" : status.label === "Pending Verification" ? "text-[#FF9F1C]" : "text-foreground"}`}>{status.label}</span></p>
            {task.dueDate && status.label !== "Completed" && (
              <p><span className="text-muted-foreground">due: </span><span className={isOverdue ? "text-[#FF4D4F]" : "text-foreground"}>{new Date(task.dueDate).toLocaleString()}{isOverdue ? " (overdue)" : ""}</span></p>
            )}
            {submissionCount > 0 && (
              <p><span className="text-muted-foreground">attempts: </span><span className="text-foreground">{submissionCount}/2 used</span></p>
            )}
            {task.leetcodeSlug && (
              <p><span className="text-muted-foreground">leetcode: </span>
                <a href={`https://leetcode.com/problems/${task.leetcodeSlug}/`} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">{task.leetcodeSlug}</a>
              </p>
            )}
          </div>
        </section>

        {/* Description */}
        {task.description && (
          <>
            <hr className="border-border" />
            <section className="py-4">
              <p className="text-sm font-semibold text-foreground mb-2">&gt; description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </section>
          </>
        )}

        {/* Latest Submission */}
        {latestSubmission && (
          <>
            <hr className="border-border" />
            <section className="py-4 border border-border p-4">
              <p className="text-sm font-semibold text-foreground mb-3">&gt; latest submission</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">status: </span>
                  <span className={latestSubmission.status === "VERIFIED" ? "text-[#3FB950]" : latestSubmission.status === "PENDING" ? "text-[#FF9F1C]" : "text-[#FF4D4F]"}>
                    {latestSubmission.status === "VERIFIED" ? `verified (+${latestSubmission.points} pts)` : latestSubmission.status === "PENDING" ? "awaiting verification" : "rejected"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">link: </span>
                  <a href={latestSubmission.link} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline break-all">{latestSubmission.link}</a>
                </p>
                <p><span className="text-muted-foreground">submitted: </span><span className="text-foreground">{new Date(latestSubmission.createdAt).toLocaleString()}</span></p>
              </div>
            </section>
          </>
        )}

        {/* Actions */}
        <hr className="border-border" />
        <section className="py-4">
          {status.canSubmit && (
            <button onClick={handleOpenSubmitModal} className="text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors">
              [ {submissionCount > 0 ? "RESUBMIT" : "SUBMIT"} SOLUTION ]
            </button>
          )}
          {!status.canSubmit && status.label === "Completed" && (
            <p className="text-[#3FB950] text-sm">[✓] you have completed this task!</p>
          )}
          {!status.canSubmit && status.label === "Pending Verification" && (
            <p className="text-[#FF9F1C] text-sm">[…] your submission is awaiting verification</p>
          )}
          {!status.canSubmit && status.label === "Max Attempts Reached" && (
            <p className="text-muted-foreground text-sm">[!] maximum submission attempts reached</p>
          )}
        </section>
      </div>

      {/* Submit Modal */}
      {submitModalOpen && task && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-foreground">&gt; submit solution</p>
                <p className="text-sm text-muted-foreground mt-1">{task.title}</p>
              </div>
              <button onClick={handleCloseSubmitModal} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground mb-4 space-y-1">
              <p>points: <span className="text-foreground">{task.points}</span></p>
              {task.dueDate && <p>due: <span className={new Date(task.dueDate) < new Date() ? "text-[#FF4D4F]" : "text-foreground"}>{new Date(task.dueDate).toLocaleString()}</span></p>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="link" className="text-sm text-muted-foreground">solution_link:</Label>
                <Input id="link" type="url" placeholder="https://github.com/user/repo" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} className="mt-1 bg-background border-border" required />
              </div>
              {submissionCount > 0 && (
                <div className="text-xs text-[#FF9F1C] border border-[#FF9F1C]/30 p-2">! this is your final attempt (2/2 max)</div>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={submitting || !submissionLink.trim()} className="flex-1 text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> submitting...</>) : "[ SUBMIT ]"}
                </button>
                <button type="button" onClick={handleCloseSubmitModal} className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
