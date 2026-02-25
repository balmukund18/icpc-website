"use client";

import { useEffect } from "react";

import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-lg space-y-6">
        <div className="text-[#FF4D4F] text-sm font-mono">
          &gt; ERROR: something went wrong
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Runtime Error
        </h1>

        <p className="text-muted-foreground text-sm">
          an unexpected error occurred. our team has been notified.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            error.id: {error.digest}
          </p>
        )}

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button className="inline-flex items-center gap-2 text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            [ RETRY ]
          </button>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 w-full sm:w-auto text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              [ DASHBOARD ]
            </button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground">
          &gt; even the best code has bad days
        </div>
      </div>
    </div>
  );
}
