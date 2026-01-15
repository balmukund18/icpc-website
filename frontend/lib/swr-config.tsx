"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import api from "./axios";
import { toast } from "sonner";

// Global fetcher function - extracts data from API response
const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data.data || response.data;
};

// 7 minutes in milliseconds
const STALE_TIME = 7 * 60 * 1000;

// Global SWR configuration
const swrConfig = {
  fetcher,
  revalidateOnFocus: false,       // Don't refetch when tab gains focus
  revalidateOnReconnect: false,   // Don't refetch on network reconnect
  dedupingInterval: STALE_TIME,   // 7 minutes - dedupe identical requests
  errorRetryCount: 2,             // Retry failed requests twice
  onError: (error: any, key: string) => {
    // Don't show toast for certain expected errors
    if (error?.response?.status === 401) {
      return; // Auth errors handled elsewhere
    }
    // Show toast on error but don't block UI
    const message = error?.response?.data?.error || error?.message || "Failed to fetch data";
    toast.error(message);
  },
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}

export { STALE_TIME };
