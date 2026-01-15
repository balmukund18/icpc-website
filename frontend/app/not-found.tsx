"use client";

import { Button } from "@/components/ui/button";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-lg">
        {/* Floating ghost animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative animate-bounce">
            <Ghost className="h-24 w-24 text-primary mx-auto" />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>

        <p className="text-muted-foreground mb-8">
          Looks like this page went on vacation and forgot to tell us.
          <br />
          Let&apos;s get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
