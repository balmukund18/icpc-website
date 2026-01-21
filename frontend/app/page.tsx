"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Waves } from "@/components/ui/wave-background";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Wave Background */}
      <Waves className="absolute inset-0 h-full w-full" />
      
      {/* Gradient overlay for text visibility */}
      <div className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,_black_0%,_black_20%,_transparent_60%)]" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-20 text-center">
        <h1 className="text-6xl font-bold text-white">
          Welcome to <span className="text-blue-500">ICPC Portal</span>
        </h1>

        <p className="mt-3 text-2xl text-neutral-200">
          USICT ACM Student Chapter
        </p>

        <div className="flex mt-6 gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
