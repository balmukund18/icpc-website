"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw, Home, Bug } from "lucide-react";
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
      <div className="text-center p-8 max-w-lg">
        {/* Animated error icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative bg-destructive/10 rounded-full p-6 w-fit mx-auto border border-destructive/20">
            <AlertOctagon className="h-12 w-12 text-destructive animate-bounce" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Something went wrong!
        </h1>

        <p className="text-muted-foreground mb-2">
          We hit an unexpected error. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Fun element */}
        <div className="text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
          <Bug className="h-3 w-3" />
          <span>Even the best code has bad days</span>
        </div>
      </div>
    </div>
  );
}
