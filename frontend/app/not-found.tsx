"use client";


import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-lg space-y-6">
        <div className="text-[#FF4D4F] text-sm font-mono">
          &gt; 404: page not found
        </div>

        <h1 className="text-6xl font-bold text-foreground">
          404
        </h1>

        <p className="text-muted-foreground text-sm">
          the requested page does not exist.<br />
          let&apos;s get you back on track.
        </p>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 w-full sm:w-auto text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors">
              <Home className="h-4 w-4" />
              [ DASHBOARD ]
            </button>
          </Link>
          <button
            className="inline-flex items-center gap-2 text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            [ GO BACK ]
          </button>
        </div>
      </div>
    </div>
  );
}
