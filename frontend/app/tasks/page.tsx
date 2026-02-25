"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/useTaskStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TasksPageSkeleton } from "@/components/ui/skeletons";
import { useTasks, useUserPoints, invalidateTasks } from "@/lib/hooks/useData";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getTaskStatus, verifyLeetCode } from "@/lib/taskService";
import type { Task } from "@/lib/hooks/useData";

type FilterType = "all" | "available" | "pending" | "completed";

/* ── Difficulty from points ── */
function getDifficulty(points: number) {
  if (points >= 50) return { label: "hard", color: "#F85149" };
  if (points >= 20) return { label: "medium", color: "#D29922" };
  return { label: "easy", color: "#3FB950" };
}

/* ── Terminal verify animation lines ── */
const VERIFY_LINES = [
  "> verifying submission...",
  "> running test cases...",
  "> checking LeetCode profile...",
];

export default function TasksPage() {
  const router = useRouter();
  const { tasks, isLoading } = useTasks();
  const { points: userPoints } = useUserPoints();
  const { submitSolution } = useTaskStore();

  const [filter, setFilter] = useState<FilterType>("all");
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyLines, setVerifyLines] = useState<string[]>([]);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    try { new URL(submissionLink); } catch { toast.error("Please enter a valid URL"); return; }
    setSubmitting(true);
    try {
      await submitSolution(selectedTask.id, submissionLink.trim());
      await invalidateTasks();
      toast.success("Solution submitted successfully!");
      handleCloseSubmitModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err.response?.data?.error || err.message || "Failed to submit solution");
    } finally { setSubmitting(false); }
  };

  const handleVerifyLeetcode = async (task: Task) => {
    setVerifying(task.id);
    setVerifyLines([]);
    // Show animated terminal lines
    for (let i = 0; i < VERIFY_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setVerifyLines((prev) => [...prev, VERIFY_LINES[i]]);
    }
    try {
      await verifyLeetCode(task.id);
      await invalidateTasks();
      setVerifyLines((prev) => [...prev, "> ✓ accepted! points awarded."]);
      toast.success("LeetCode submission verified! Points awarded.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      setVerifyLines((prev) => [...prev, `> ✗ ${err.response?.data?.error || "verification failed"}`]);
      toast.error(err.response?.data?.error || err.message || "Failed to verify");
    } finally {
      setTimeout(() => { setVerifying(null); setVerifyLines([]); }, 2000);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const status = getTaskStatus(task);
    switch (filter) {
      case "available": return status.canSubmit && !task.userSubmissions?.length;
      case "pending": return task.userSubmissions?.some((s) => s.status === "PENDING");
      case "completed": return task.userSubmissions?.some((s) => s.status === "VERIFIED");
      default: return true;
    }
  });

  /* ── Keyboard shortcuts ── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
    if (submitModalOpen) return;

    const key = e.key.toLowerCase();
    if (key === "arrowdown" || key === "j") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.min(prev + 1, filteredTasks.length - 1));
    } else if (key === "arrowup" || key === "k") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.max(prev - 1, 0));
    } else if (key === "o" || key === "enter") {
      if (focusedIdx >= 0 && focusedIdx < filteredTasks.length) {
        e.preventDefault();
        router.push(`/tasks/${filteredTasks[focusedIdx].id}`);
      }
    } else if (key === "v") {
      if (focusedIdx >= 0 && focusedIdx < filteredTasks.length) {
        const task = filteredTasks[focusedIdx];
        if (task.leetcodeSlug && getTaskStatus(task).canSubmit) {
          e.preventDefault();
          handleVerifyLeetcode(task);
        }
      }
    }
  }, [filteredTasks, focusedIdx, submitModalOpen, router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll focused into view
  useEffect(() => {
    if (focusedIdx >= 0 && taskRefs.current[focusedIdx]) {
      taskRefs.current[focusedIdx]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIdx]);

  if (isLoading) {
    return (<DashboardLayout><TasksPageSkeleton /></DashboardLayout>);
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">tasks</span>{" "}
            <span className="font-normal text-muted-foreground">--challenge-board</span>
          </h1>
        </section>

        {/* Filter tabs */}
        <section className="py-3 flex flex-wrap gap-2">
          {([
            { id: "all" as FilterType, label: "All Tasks" },
            { id: "available" as FilterType, label: "Available" },
            { id: "pending" as FilterType, label: "Pending" },
            { id: "completed" as FilterType, label: "Completed" },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setFocusedIdx(-1); }}
              className={`px-3 py-1 text-sm border transition-colors ${filter === f.id
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              [ {f.label} ]
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-auto self-center">{userPoints} pts</span>
        </section>

        <hr className="border-border" />

        {/* Verify terminal animation */}
        <AnimatePresence>
          {verifyLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="py-3 px-4 bg-[#161B22] border border-border my-2">
                {verifyLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-mono ${line.includes("✓") ? "text-[#3FB950]" : line.includes("✗") ? "text-[#F85149]" : "text-[#8B949E]"}`}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks list */}
        {filteredTasks.length === 0 ? (
          <section className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              &gt; {filter === "all" ? "no tasks available yet" : `no ${filter} tasks`}
            </p>
          </section>
        ) : (
          <section className="py-2">
            {filteredTasks.map((task, i) => {
              const status = getTaskStatus(task);
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              const latestSubmission = task.userSubmissions?.[0];
              const isVerified = latestSubmission?.status === "VERIFIED";
              const diff = getDifficulty(task.points);
              const isFocused = focusedIdx === i;

              return (
                <motion.div
                  key={task.id}
                  ref={(el) => { taskRefs.current[i] = el; }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.25 }}
                  className={`py-4 border-b border-border/50 transition-colors ${isFocused ? "bg-[#58A6FF]/5 border-l-2 border-l-[#58A6FF] pl-3 -ml-[2px]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <motion.span
                      className="text-lg mt-0.5"
                      animate={isVerified ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isVerified ? (
                        <span className="text-[#3FB950]">[✓]</span>
                      ) : (
                        <span className="text-muted-foreground">[ ]</span>
                      )}
                    </motion.span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/tasks/${task.id}`} className="hover:underline">
                          <span className="font-semibold text-foreground text-base">{task.title}</span>
                        </Link>
                        {/* Difficulty badge */}
                        <span className="text-[10px] px-1.5 py-0.5 border" style={{ color: diff.color, borderColor: diff.color + "30" }}>
                          {diff.label}
                        </span>
                      </div>

                      {/* Points & badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{task.points} pts</span>
                        {isVerified && (
                          <span className="text-xs px-1.5 py-0.5 bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30">
                            ✓ completed
                          </span>
                        )}
                        {latestSubmission?.status === "PENDING" && (
                          <span className="text-xs px-1.5 py-0.5 bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/30">
                            pending
                          </span>
                        )}
                        {isOverdue && status.canSubmit && (
                          <span className="text-[#F85149] text-xs">overdue</span>
                        )}
                        {task.dueDate && !isOverdue && status.canSubmit && (
                          <span className="text-xs text-muted-foreground">
                            due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {task.leetcodeSlug && (
                          <a href={`https://leetcode.com/problems/${task.leetcodeSlug}/`} target="_blank" rel="noopener noreferrer"
                            className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5">
                            <ExternalLink className="h-3 w-3" /> SOLVE ON LEETCODE
                          </a>
                        )}
                        {status.canSubmit && task.leetcodeSlug && (
                          <button
                            onClick={() => handleVerifyLeetcode(task)}
                            disabled={verifying === task.id}
                            className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {verifying === task.id ? (
                              <><Loader2 className="h-3 w-3 animate-spin" /> VERIFYING...</>
                            ) : (
                              "↓ VERIFY"
                            )}
                          </button>
                        )}
                        {status.canSubmit && !task.leetcodeSlug && (
                          <button onClick={() => handleOpenSubmitModal(task)}
                            className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted transition-colors">
                            [ SUBMIT ]
                          </button>
                        )}
                        {isFocused && (
                          <span className="text-[10px] text-[#484F58] ml-auto">O open · V verify</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}

        {/* Keyboard hint */}
        <div className="py-4 border-t border-border">
          <p className="text-[10px] text-[#484F58] text-center">
            ↑↓ navigate · O open task · V verify · keyboard shortcuts active
          </p>
        </div>
      </div>

      {/* Submit Solution Modal */}
      <AnimatePresence>
        {submitModalOpen && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-card border border-border w-full max-w-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">&gt; submit solution</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.title}</p>
                </div>
                <button onClick={handleCloseSubmitModal} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>points: <span className="text-foreground">{selectedTask.points}</span></p>
                {selectedTask.dueDate && (
                  <p>due: <span className={new Date(selectedTask.dueDate) < new Date() ? "text-[#F85149]" : "text-foreground"}>
                    {new Date(selectedTask.dueDate).toLocaleString()}
                  </span></p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="link" className="text-sm text-muted-foreground">solution_link:</Label>
                  <Input id="link" type="url" placeholder="https://github.com/user/repo" value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)} className="mt-1 bg-background border-border" required />
                </div>
                {(selectedTask.userSubmissions?.length || 0) > 0 && (
                  <div className="text-xs text-[#D29922] border border-[#D29922]/30 p-2">! this is your final attempt (2/2 max)</div>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting || !submissionLink.trim()}
                    className="flex-1 text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> submitting...</>) : "[ SUBMIT ]"}
                  </button>
                  <button type="button" onClick={handleCloseSubmitModal}
                    className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
