"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getContest,
  submitSolution,
  getMySubmissions,
  Contest,
  ContestSubmission,
  Problem,
} from "@/lib/contestService";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CodeEditor,
  LANGUAGES,
  CODE_TEMPLATES,
} from "@/components/code-editor";
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

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [contestEnded, setContestEnded] = useState(false);

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

        // Initialize code with template
        setCode(CODE_TEMPLATES[54] || "");

        // Calculate timer
        if (data.timer) {
          const startTime = new Date(data.createdAt).getTime();
          const endTime = startTime + data.timer * 60 * 1000;
          const remaining = endTime - Date.now();

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

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1000) {
          setContestEnded(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Update code template when language changes
  const handleLanguageChange = (value: string) => {
    const newLangId = parseInt(value);
    setLanguageId(newLangId);
    // Only set template if code is empty or matches another template
    const currentTemplate = CODE_TEMPLATES[languageId];
    if (!code || code === currentTemplate) {
      setCode(CODE_TEMPLATES[newLangId] || "");
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!code.trim()) {
      setSubmissionError("Please write some code before submitting");
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
          {contest.timer && (
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
          )}
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
                <h2 className="text-2xl font-bold mb-4">
                  {currentProblem.title || `Problem ${selectedProblemIdx + 1}`}
                </h2>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300">
                    {currentProblem.description || "No description available."}
                  </div>

                  {currentProblem.testCases &&
                    currentProblem.testCases.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Examples</h3>
                        {currentProblem.testCases.map((tc, idx) => (
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
                    )}
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

              <Button
                onClick={handleSubmit}
                disabled={submitting || contestEnded}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Submitting..." : "Submit Solution"}
              </Button>
            </div>

            {/* Error message */}
            {submissionError && (
              <div className="mx-3 mt-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {submissionError}
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 p-3 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                languageId={languageId}
                height="100%"
                readOnly={contestEnded}
              />
            </div>

            {/* Latest Submission Result */}
            {problemSubmissions.length > 0 && (
              <div className="border-t border-gray-800 p-3 bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Latest Result
                </h3>
                <div className="bg-gray-800/50 rounded p-3">
                  <div
                    className={`font-medium ${getStatusColor(
                      problemSubmissions[0].status
                    )}`}
                  >
                    {problemSubmissions[0].status || "Pending..."}
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
                  {problemSubmissions[0].result?.stderr && (
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-red-400 text-xs overflow-x-auto">
                      {problemSubmissions[0].result.stderr}
                    </pre>
                  )}
                  {problemSubmissions[0].result?.compile_output && (
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-orange-400 text-xs overflow-x-auto">
                      {problemSubmissions[0].result.compile_output}
                    </pre>
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
