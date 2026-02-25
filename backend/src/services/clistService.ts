// Fetches upcoming Codeforces contests using the official public API.
// (LeetCode & CodeChef removed — their endpoints are blocked by Cloudflare
//  on datacenter IPs like Render.)

export interface ExternalContest {
    name: string;
    url: string;
    startTime: string; // ISO-8601
    endTime: string;
    duration: number;  // seconds
    platform: string;
    platformIcon: string;
}

// ── In-memory cache ────────────────────────────────────────────────────────────
let cache: ExternalContest[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const FETCH_TIMEOUT_MS = 6_000;

function timedFetch(url: string, init?: RequestInit): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    return fetch(url, { ...init, signal: ctrl.signal }).finally(() =>
        clearTimeout(timer)
    );
}

// ── Public entry point ─────────────────────────────────────────────────────────
export async function getExternalContests(): Promise<ExternalContest[]> {
    const now = Date.now();
    if (cache.length > 0 && now - cacheTimestamp < CACHE_TTL) {
        return cache;
    }

    try {
        const res = await timedFetch(
            "https://codeforces.com/api/contest.list?gym=false",
            { headers: { Accept: "application/json" } }
        );
        if (!res.ok) {
            console.warn(`Codeforces API error ${res.status}`);
            return cache;
        }
        const data = (await res.json()) as {
            status: string;
            result: Array<{
                id: number;
                name: string;
                phase: string;
                durationSeconds: number;
                startTimeSeconds?: number;
            }>;
        };
        if (data.status !== "OK") return cache;

        cache = data.result
            .filter((c) => c.phase === "BEFORE" && c.startTimeSeconds)
            .map((c) => {
                const startMs = c.startTimeSeconds! * 1000;
                return {
                    name: c.name,
                    url: `https://codeforces.com/contest/${c.id}`,
                    startTime: new Date(startMs).toISOString(),
                    endTime: new Date(startMs + c.durationSeconds * 1000).toISOString(),
                    duration: c.durationSeconds,
                    platform: "Codeforces",
                    platformIcon: "CF",
                };
            })
            .filter((c) => new Date(c.startTime).getTime() > now)
            .slice(0, 20);

        cacheTimestamp = now;
        console.log(`External contests fetched: CF=${cache.length}`);
        return cache;
    } catch (err) {
        console.warn("Codeforces fetch failed:", (err as Error).message);
        return cache;
    }
}
