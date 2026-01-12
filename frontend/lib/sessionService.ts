import api from "./axios";

export interface Session {
  id: string;
  title: string;
  details: string | null;
  meetLink: string;
  date: string | null;
  attendees: string[] | null;
  summary: string | null;
  createdAt: string;
}

export type SessionStatus = "upcoming" | "live" | "ended";

/**
 * Determine the status of a session based on its date
 * - upcoming: more than 15 minutes before session start
 * - live: from 15 minutes before until end of that day (midnight)
 * - ended: after the session day has passed
 */
export function getSessionStatus(session: Session): SessionStatus {
  if (!session.date) return "upcoming"; // No date = treat as upcoming/TBA

  const sessionTime = new Date(session.date).getTime();
  const now = Date.now();
  const fifteenMinBefore = sessionTime - 15 * 60 * 1000;

  // End of session day (midnight)
  const endOfDay = new Date(session.date);
  endOfDay.setHours(23, 59, 59, 999);

  if (now < fifteenMinBefore) return "upcoming";
  if (now <= endOfDay.getTime()) return "live";
  return "ended";
}

/**
 * Get all sessions (public endpoint - no auth required)
 */
export async function getSessions(): Promise<Session[]> {
  const response = await api.get("/sessions");
  return response.data.data || response.data;
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<Session> {
  const response = await api.get(`/sessions/${id}`);
  return response.data.data || response.data;
}

/**
 * Register for a session (requires authentication)
 */
export async function registerForSession(sessionId: string): Promise<Session> {
  const response = await api.post(`/sessions/${sessionId}/register`);
  return response.data.data || response.data;
}
