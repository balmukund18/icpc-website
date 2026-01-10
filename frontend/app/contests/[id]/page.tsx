"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getContest,
  submitSolution,
  getMySubmissions,
  runCode,
  Contest,
  ContestSubmission,
  Problem,
  RunCodeResult,
} from "@/lib/contestService";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CodeEditor,
  LANGUAGES,
  CODE_TEMPLATES,
} from "@/components/code-editor";
import { useCodePersistence } from "@/lib/hooks/useCodePersistence";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContestDetailPage() {
  const params = useParams();
  const contestId = params.id as string;
  const router = useRouter();
  const { token } = useAuthStore();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Problem & Editor state
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [code, setCode] = useState<string>("");
  const [languageId, setLanguageId] = useState(54); // Default to C++

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Run code state
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [lastRunTime, setLastRunTime] = useState<number>(0);
  const RUN_COOLDOWN_MS = 6000; // 6 seconds between runs

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [contestEnded, setContestEnded] = useState(false);
  const [contestStarted, setContestStarted] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);
  const [contestEndTime, setContestEndTime] = useState<number | null>(null);

  // Get default code template for current language
  const defaultCode = useMemo(
    () => CODE_TEMPLATES[languageId] || "",
    [languageId]
  );

  // Code persistence hook
  const { loadCode, saveCode, clearContestCode } = useCodePersistence(
    contestId,
    contestEndTime,
    selectedProblemIdx,
    languageId,
    defaultCode
  );

  // Fetch contest data
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchContest() {
      try {
        const data = await getContest(contestId);
        setContest(data);

        // Calculate contest end time
        const startTime = new Date(data.startTime).getTime();
        const endTime = startTime + data.timer * 60 * 1000;
        setContestEndTime(endTime);

        // Initialize code with template (will be overridden by loadCode effect)
        setCode(CODE_TEMPLATES[54] || "");

        // Calculate contest status using startTime
        const now = Date.now();
        
        if (now < startTime) {
          // Contest hasn't started yet
          setContestStarted(false);
          setTimeUntilStart(startTime - now);
        } else {
          // Contest has started
          setContestStarted(true);
          setTimeUntilStart(null);
          
          // Calculate time remaining until end
          const remaining = endTime - now;

          if (remaining <= 0) {
            setContestEnded(true);
            setTimeRemaining(0);
          } else {
            setTimeRemaining(remaining);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch contest");
      } finally {
        setLoading(false);
      }
    }

    fetchContest();
  }, [contestId, token, router]);

  // Fetch user's submissions
  useEffect(() => {
    if (!token || !contestId) return;

    async function fetchSubmissions() {
      try {
        const data = await getMySubmissions(contestId);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        // Submissions might not exist yet, ignore error
      }
    }

    fetchSubmissions();
    // Poll for submission updates every 5 seconds
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [contestId, token]);

  // Countdown until contest starts
  useEffect(() => {
    if (contestStarted || timeUntilStart === null) return;

    const interval = setInterval(() => {
      setTimeUntilStart((prev) => {
        if (prev === null || prev <= 1000) {
          // Contest is starting now!
          setContestStarted(true);
          // Set time remaining to full duration
          if (contest?.timer) {
            setTimeRemaining(contest.timer * 60 * 1000);
          }
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [contestStarted, timeUntilStart, contest?.timer]);

  // Timer countdown (for active contest)
  useEffect(() => {
    if (!contestStarted || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1000) {
          setContestEnded(true);
          // Clear saved code immediately when contest ends
          clearContestCode();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [contestStarted, timeRemaining, clearContestCode]);

  // Load saved code when problem or language changes
  useEffect(() => {
    if (!contestId || !contestEndTime || loading) return;
    
    // Don't load if contest hasn't started or has ended
    if (!contestStarted || contestEnded) return;

    const savedCode = loadCode();
    setCode(savedCode);
  }, [contestId, contestEndTime, selectedProblemIdx, languageId, contestStarted, contestEnded, loading, loadCode]);

  // Save code on changes (debounced via hook)
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      // Save to localStorage (debounced in hook)
      saveCode(newCode);
    },
    [saveCode]
  );

  // Handle language change - load saved code for new language
  const handleLanguageChange = (value: string) => {
    const newLangId = parseInt(value);
    setLanguageId(newLangId);
    // Code will be loaded by the useEffect above when languageId changes
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!code.trim()) {
      setSubmissionError("Please write some code before submitting");
      return;
    }

    if (!contestStarted) {
      setSubmissionError("Contest has not started yet. Please wait.");
      return;
    }

    if (contestEnded) {
      setSubmissionError("Contest has ended. Submissions are closed.");
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    try {
      await submitSolution(contestId, selectedProblemIdx, code, languageId);
      // Refresh submissions
      const data = await getMySubmissions(contestId);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setSubmissionError(
        err.response?.data?.message || "Failed to submit solution"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Run code against sample test cases
  const handleRunCode = async () => {
    if (!code.trim()) {
      setRunError("Please write some code before running");
      return;
    }

    if (!contestStarted) {
      setRunError("Contest has not started yet. Please wait.");
      return;
    }

    if (contestEnded) {
      setRunError("Contest has ended.");
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastRunTime < RUN_COOLDOWN_MS) {
      const remaining = Math.ceil((RUN_COOLDOWN_MS - (now - lastRunTime)) / 1000);
      setRunError(`Please wait ${remaining} seconds before running again`);
      return;
    }

    setRunning(true);
    setRunError(null);
    setRunResult(null);

    try {
      const result = await runCode(contestId, selectedProblemIdx, code, languageId);
      setRunResult(result);
      setLastRunTime(Date.now());
    } catch (err: any) {
      // Check for rate limit error
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.["retry-after"] || 60;
        setRunError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      } else {
        setRunError(err.response?.data?.message || "Failed to run code");
      }
    } finally {
      setRunning(false);
    }
  };

  // Check if run button should be disabled (cooldown)
  const isRunCooldown = Date.now() - lastRunTime < RUN_COOLDOWN_MS;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "text-gray-400";
    const s = status.toLowerCase();
    if (s.includes("accepted")) return "text-green-400";
    if (s.includes("wrong")) return "text-red-400";
    if (
      s.includes("pending") ||
      s.includes("queue") ||
      s.includes("processing")
    )
      return "text-yellow-400";
    if (s.includes("error") || s.includes("limit")) return "text-orange-400";
    return "text-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading contest...</div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">
            {error || "Contest not found"}
          </p>
          <Link href="/contests">
            <Button variant="outline">Back to Contests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const problems = contest.problems || [];
  const currentProblem: Problem | null = problems[selectedProblemIdx] || null;
  const problemSubmissions = submissions.filter(
    (s) => s.problemIdx === selectedProblemIdx
  );

  // Show countdown screen if contest hasn't started
  if (!contestStarted && timeUntilStart !== null) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-[1800px] mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/contests">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{contest.title}</h1>
            </div>
            <div className="px-4 py-2 rounded-lg font-mono text-lg bg-yellow-500/20 text-yellow-400">
              Upcoming
            </div>
          </div>
        </div>

        {/* Countdown Screen */}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-57px)]">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-4">Contest Starts In</div>
            <div className="text-6xl font-mono font-bold text-white mb-6">
              {formatCountdown(timeUntilStart)}
            </div>
            <div className="text-gray-400 mb-2">
              {new Date(contest.startTime).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-gray-500 mb-8">
              {new Date(contest.startTime).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-sm text-gray-400 mb-3">Contest Details</div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Duration:</span>
                <span className="text-white">{contest.timer} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Problems:</span>
                <span className="text-white">{problems.length} problems</span>
              </div>
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              Problems will be revealed when the contest starts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/contests">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{contest.title}</h1>
          </div>

          {/* Timer */}
          <div
            className={`px-4 py-2 rounded-lg font-mono text-lg ${
              contestEnded
                ? "bg-red-500/20 text-red-400"
                : timeRemaining && timeRemaining < 300000
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {contestEnded
              ? "Contest Ended"
              : `Time: ${formatTime(timeRemaining || 0)}`}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar - Problem List */}
        <div className="w-64 border-r border-gray-800 bg-gray-900/30 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              PROBLEMS
            </h2>
            <div className="space-y-2">
              {problems.map((problem, idx) => {
                const hasAccepted = submissions.some(
                  (s) =>
                    s.problemIdx === idx &&
                    s.status?.toLowerCase().includes("accepted")
                );
                const hasSubmission = submissions.some(
                  (s) => s.problemIdx === idx
                );

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedProblemIdx(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedProblemIdx === idx
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-800 text-gray-300"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasAccepted
                          ? "bg-green-400"
                          : hasSubmission
                          ? "bg-yellow-400"
                          : "bg-gray-600"
                      }`}
                    />
                    <span className="truncate">
                      {idx + 1}. {problem.title || `Problem ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submissions for current problem */}
          <div className="border-t border-gray-800 p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              YOUR SUBMISSIONS
            </h2>
            {problemSubmissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {problemSubmissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="text-sm p-2 bg-gray-800/50 rounded"
                  >
                    <div
                      className={`font-medium ${getStatusColor(sub.status)}`}
                    >
                      {sub.status || "Pending"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(sub.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Problem Description */}
          <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
            {currentProblem ? (
              <>
                <h2 className="text-2xl font-bold mb-3">
                  {currentProblem.title || `Problem ${selectedProblemIdx + 1}`}
                </h2>

                {/* Difficulty Badge and Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentProblem.difficulty && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(
                        currentProblem.difficulty
                      )}`}
                    >
                      {currentProblem.difficulty}
                    </span>
                  )}
                  {currentProblem.tags &&
                    currentProblem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                {/* Constraints Box */}
                {currentProblem.constraints && (
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-6 text-sm">
                      {currentProblem.constraints.timeLimit && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Time Limit:</span>
                          <span className="text-white font-medium">
                            {currentProblem.constraints.timeLimit}s
                          </span>
                        </div>
                      )}
                      {currentProblem.constraints.memoryLimit && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Memory Limit:</span>
                          <span className="text-white font-medium">
                            {currentProblem.constraints.memoryLimit} MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300">
                    {currentProblem.description || "No description available."}
                  </div>

                  {/* Sample Test Cases */}
                  {(() => {
                    const sampleTCs = currentProblem.sampleTestCases || currentProblem.testCases || [];
                    return sampleTCs.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Examples</h3>
                        {sampleTCs.map((tc, idx) => (
                          <div
                            key={idx}
                            className="mb-4 bg-gray-800/50 rounded-lg p-4"
                          >
                            <div className="mb-2">
                              <span className="text-sm text-gray-400">
                                Input:
                              </span>
                              <pre className="mt-1 p-2 bg-gray-900 rounded text-sm overflow-x-auto">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">
                                Output:
                              </span>
                              <pre className="mt-1 p-2 bg-gray-900 rounded text-sm overflow-x-auto">
                                {tc.output}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <p className="text-gray-400">No problem selected</p>
            )}
          </div>

          {/* Code Editor */}
          <div className="w-1/2 flex flex-col">
            {/* Editor Controls */}
            <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <Select
                value={languageId.toString()}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.id}
                      value={lang.id.toString()}
                      className="text-white hover:bg-gray-700"
                    >
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  onClick={handleRunCode}
                  disabled={running || contestEnded || isRunCooldown}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  {running ? "Running..." : "Run Code"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || contestEnded}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Submitting..." : "Submit Solution"}
                </Button>
              </div>
            </div>

            {/* Error message */}
            {submissionError && (
              <div className="mx-3 mt-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {submissionError}
              </div>
            )}
            {runError && (
              <div className="mx-3 mt-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {runError}
              </div>
            )}

            {/* Run Code Result Panel */}
            {runResult && (
              <div className="mx-3 mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {runResult.compileError ? (
                      <span className="text-orange-400 font-medium">Compilation Error</span>
                    ) : runResult.allPassed ? (
                      <span className="text-green-400 font-medium">All Sample Tests Passed</span>
                    ) : (
                      <span className="text-red-400 font-medium">
                        {runResult.passedCount}/{runResult.totalCount} Sample Tests Passed
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setRunResult(null)}
                    className="text-gray-500 hover:text-gray-300 text-sm"
                  >
                    Dismiss
                  </button>
                </div>

                {/* Compilation Error */}
                {runResult.compileError && (
                  <pre className="p-2 bg-gray-900 rounded text-orange-400 text-xs overflow-x-auto whitespace-pre-wrap">
                    {runResult.compileError}
                  </pre>
                )}

                {/* First Failed Test Case (LeetCode style) */}
                {!runResult.compileError && runResult.firstFailed && (
                  <div className="space-y-2 mt-2">
                    <div className="text-sm text-gray-400">
                      Failed Test Case #{runResult.firstFailed.index + 1}
                    </div>
                    
                    {runResult.firstFailed.error ? (
                      <div className="p-2 bg-gray-900 rounded">
                        <div className="text-xs text-gray-500 mb-1">Error:</div>
                        <pre className="text-red-400 text-xs overflow-x-auto whitespace-pre-wrap">
                          {runResult.firstFailed.error}
                        </pre>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="p-2 bg-gray-900 rounded">
                            <div className="text-xs text-gray-500 mb-1">Input:</div>
                            <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap">
                              {runResult.firstFailed.input || "(hidden)"}
                            </pre>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-900 rounded">
                              <div className="text-xs text-gray-500 mb-1">Expected:</div>
                              <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                                {runResult.firstFailed.expected || "(hidden)"}
                              </pre>
                            </div>
                            <div className="p-2 bg-gray-900 rounded">
                              <div className="text-xs text-gray-500 mb-1">Actual:</div>
                              <pre className="text-red-400 text-xs overflow-x-auto whitespace-pre-wrap">
                                {runResult.firstFailed.actual || "(no output)"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Execution Stats */}
                {!runResult.compileError && (runResult.time || runResult.memory) && (
                  <div className="mt-2 text-xs text-gray-500 flex gap-4">
                    {runResult.time && <span>Time: {runResult.time}s</span>}
                    {runResult.memory && <span>Memory: {runResult.memory} KB</span>}
                  </div>
                )}
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 p-3 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                languageId={languageId}
                height="100%"
                readOnly={contestEnded}
              />
            </div>

            {/* Latest Submission Result */}
            {problemSubmissions.length > 0 && (
              <div className="border-t border-gray-800 p-3 bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Latest Submission
                </h3>
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`font-medium ${getStatusColor(
                        problemSubmissions[0].status
                      )}`}
                    >
                      {problemSubmissions[0].status || "Pending..."}
                    </div>
                    {problemSubmissions[0].result?.passedCount !== undefined && (
                      <div className="text-sm text-gray-400">
                        {problemSubmissions[0].result.passedCount}/{problemSubmissions[0].result.totalCount} tests passed
                      </div>
                    )}
                  </div>
                  {problemSubmissions[0].result && (
                    <div className="mt-2 text-sm text-gray-400">
                      {problemSubmissions[0].result.time && (
                        <span className="mr-4">
                          Time: {problemSubmissions[0].result.time}s
                        </span>
                      )}
                      {problemSubmissions[0].result.memory && (
                        <span>
                          Memory: {problemSubmissions[0].result.memory} KB
                        </span>
                      )}
                    </div>
                  )}
                  {problemSubmissions[0].result?.compileError && (
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-orange-400 text-xs overflow-x-auto">
                      {problemSubmissions[0].result.compileError}
                    </pre>
                  )}
                  {problemSubmissions[0].result?.firstFailed && !problemSubmissions[0].result.firstFailed.isHidden && (
                    <div className="mt-2 text-xs">
                      <div className="text-gray-500 mb-1">
                        First failed: Test #{(problemSubmissions[0].result.firstFailed.index || 0) + 1}
                      </div>
                      {problemSubmissions[0].result.firstFailed.error && (
                        <pre className="p-2 bg-gray-900 rounded text-red-400 overflow-x-auto">
                          {problemSubmissions[0].result.firstFailed.error}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
