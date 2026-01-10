"use client";

import { useCallback, useEffect, useRef } from "react";

// Storage key prefix for identifying our keys in localStorage
const STORAGE_PREFIX = "icpc_code_";
const CONTEST_META_PREFIX = "icpc_contest_";
const MAX_STORED_CONTESTS = 10;

// Types
interface StoredCode {
  code: string;
  savedAt: number;
}

interface ContestMeta {
  contestId: string;
  endTime: number; // Unix timestamp when contest ends
  lastAccessed: number; // For LRU cleanup
}

/**
 * Get the storage key for a specific problem's code
 */
function getCodeKey(
  contestId: string,
  problemIdx: number,
  languageId: number
): string {
  return `${STORAGE_PREFIX}${contestId}_${problemIdx}_${languageId}`;
}

/**
 * Get the metadata key for a contest
 */
function getContestMetaKey(contestId: string): string {
  return `${CONTEST_META_PREFIX}${contestId}`;
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Get all contest metadata entries from localStorage
 */
function getAllContestMeta(): ContestMeta[] {
  if (!isBrowser()) return [];

  const metas: ContestMeta[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONTEST_META_PREFIX)) {
      try {
        const meta = JSON.parse(localStorage.getItem(key) || "");
        if (meta && meta.contestId) {
          metas.push(meta);
        }
      } catch {
        // Invalid JSON, skip
      }
    }
  }
  return metas;
}

/**
 * Get all code keys for a specific contest
 */
function getCodeKeysForContest(contestId: string): string[] {
  if (!isBrowser()) return [];

  const keys: string[] = [];
  const prefix = `${STORAGE_PREFIX}${contestId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Delete all stored data for a contest
 */
function deleteContestData(contestId: string): void {
  if (!isBrowser()) return;

  // Delete all code entries for this contest
  const codeKeys = getCodeKeysForContest(contestId);
  codeKeys.forEach((key) => localStorage.removeItem(key));

  // Delete contest metadata
  localStorage.removeItem(getContestMetaKey(contestId));
}

/**
 * Clean up expired contests (called on page load)
 */
function cleanupExpiredContests(): void {
  if (!isBrowser()) return;

  const now = Date.now();
  const allMetas = getAllContestMeta();

  // Find and delete expired contests
  allMetas.forEach((meta) => {
    if (meta.endTime <= now) {
      deleteContestData(meta.contestId);
    }
  });
}

/**
 * Enforce max stored contests limit (LRU - keep most recently accessed)
 */
function enforceStorageLimit(): void {
  if (!isBrowser()) return;

  const allMetas = getAllContestMeta();

  if (allMetas.length <= MAX_STORED_CONTESTS) return;

  // Sort by lastAccessed (oldest first)
  allMetas.sort((a, b) => a.lastAccessed - b.lastAccessed);

  // Delete oldest contests until we're under the limit
  const toDelete = allMetas.length - MAX_STORED_CONTESTS;
  for (let i = 0; i < toDelete; i++) {
    deleteContestData(allMetas[i].contestId);
  }
}

/**
 * Save or update contest metadata
 */
function saveContestMeta(contestId: string, endTime: number): void {
  if (!isBrowser()) return;

  const meta: ContestMeta = {
    contestId,
    endTime,
    lastAccessed: Date.now(),
  };

  localStorage.setItem(getContestMetaKey(contestId), JSON.stringify(meta));
}

/**
 * Update last accessed time for a contest
 */
function touchContest(contestId: string): void {
  if (!isBrowser()) return;

  const metaKey = getContestMetaKey(contestId);
  const existing = localStorage.getItem(metaKey);

  if (existing) {
    try {
      const meta: ContestMeta = JSON.parse(existing);
      meta.lastAccessed = Date.now();
      localStorage.setItem(metaKey, JSON.stringify(meta));
    } catch {
      // Invalid, ignore
    }
  }
}

/**
 * Custom hook for persisting code in localStorage with automatic cleanup
 *
 * @param contestId - The contest ID
 * @param contestEndTime - Unix timestamp when the contest ends
 * @param problemIdx - Current problem index
 * @param languageId - Current language ID
 * @param defaultCode - Default code template to use if no saved code exists
 */
export function useCodePersistence(
  contestId: string,
  contestEndTime: number | null,
  problemIdx: number,
  languageId: number,
  defaultCode: string
) {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // Run cleanup on first mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      cleanupExpiredContests();
      enforceStorageLimit();
    }
  }, []);

  // Save contest metadata when we have valid end time
  useEffect(() => {
    if (contestId && contestEndTime && contestEndTime > Date.now()) {
      saveContestMeta(contestId, contestEndTime);
    }
  }, [contestId, contestEndTime]);

  /**
   * Load saved code from localStorage
   * Returns the saved code or defaultCode if not found
   */
  const loadCode = useCallback((): string => {
    if (!isBrowser() || !contestId) return defaultCode;

    // Check if contest has ended - if so, return default and don't load
    if (contestEndTime && contestEndTime <= Date.now()) {
      return defaultCode;
    }

    const key = getCodeKey(contestId, problemIdx, languageId);
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed: StoredCode = JSON.parse(stored);
        // Update last accessed time for LRU
        touchContest(contestId);
        return parsed.code || defaultCode;
      } catch {
        // Invalid JSON, return default
        return defaultCode;
      }
    }

    return defaultCode;
  }, [contestId, contestEndTime, problemIdx, languageId, defaultCode]);

  /**
   * Save code to localStorage (debounced to avoid excessive writes)
   */
  const saveCode = useCallback(
    (code: string): void => {
      if (!isBrowser() || !contestId) return;

      // Don't save if contest has ended
      if (contestEndTime && contestEndTime <= Date.now()) {
        return;
      }

      // Don't save empty code or just the default template
      if (!code.trim() || code === defaultCode) {
        return;
      }

      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce saves (500ms)
      debounceTimer.current = setTimeout(() => {
        const key = getCodeKey(contestId, problemIdx, languageId);
        const stored: StoredCode = {
          code,
          savedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(stored));
      }, 500);
    },
    [contestId, contestEndTime, problemIdx, languageId, defaultCode]
  );

  /**
   * Clear all code for the current contest (called when contest ends)
   */
  const clearContestCode = useCallback((): void => {
    if (!isBrowser() || !contestId) return;
    deleteContestData(contestId);
  }, [contestId]);

  /**
   * Check if there's saved code for current problem/language
   */
  const hasSavedCode = useCallback((): boolean => {
    if (!isBrowser() || !contestId) return false;

    const key = getCodeKey(contestId, problemIdx, languageId);
    return localStorage.getItem(key) !== null;
  }, [contestId, problemIdx, languageId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    loadCode,
    saveCode,
    clearContestCode,
    hasSavedCode,
  };
}

/**
 * Utility function to manually trigger cleanup (can be called from anywhere)
 */
export function manualCleanup(): void {
  cleanupExpiredContests();
  enforceStorageLimit();
}
