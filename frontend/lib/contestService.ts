import api from "./axios";

// Types
export interface Problem {
  title: string;
  description: string;
  testCases?: { input: string; output: string }[];
}

export interface Contest {
  id: string;
  title: string;
  problems: Problem[] | null;
  timer: number | null;
  results: any[] | null;
  createdAt: string;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  problemIdx: number;
  userId: string;
  token: string | null;
  result: {
    status?: { id: number; description: string };
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    time?: string;
    memory?: number;
  } | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

// API functions
export async function getContests(): Promise<Contest[]> {
  const response = await api.get("/contests");
  return response.data.data || response.data;
}

export async function getContest(id: string): Promise<Contest> {
  const response = await api.get(`/contests/${id}`);
  return response.data.data || response.data;
}

export async function submitSolution(
  contestId: string,
  problemIdx: number,
  source: string,
  language_id: number
): Promise<ContestSubmission> {
  const response = await api.post(`/contests/${contestId}/submit`, {
    problemIdx,
    source,
    language_id,
  });
  return response.data.data || response.data;
}

export async function getMySubmissions(
  contestId: string
): Promise<ContestSubmission[]> {
  const response = await api.get(`/contests/${contestId}/submissions/me`);
  return response.data.data || response.data;
}

export async function getSubmission(
  submissionId: string
): Promise<ContestSubmission> {
  const response = await api.get(`/contests/submissions/${submissionId}`);
  return response.data.data || response.data;
}

export async function getContestHistory(): Promise<any[]> {
  const response = await api.get("/contests/history/me");
  return response.data.data || response.data;
}
