"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vortex } from "@/components/ui/vortex";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

function PendingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  const [isApproved, setIsApproved] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid request");
      router.push("/login");
      return;
    }

    // Poll for approval status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/auth/approval-status/${userId}`);
        const status = response.data.data;

        // Check if approved
        if (status.approved) {
          clearInterval(pollInterval); // Stop polling immediately
          setIsApproved(true);
          toast.success("Your account has been approved!");

          // Auto-redirect to Google login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (error: unknown) {
        // Check if user was deleted (404 means user doesn't exist)
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 404) {
            clearInterval(pollInterval);
            setIsDenied(true);
            toast.error("Your account request has been denied");
          } else {
            console.error("Error checking approval status:", error);
          }
        } else {
          console.error("Error checking approval status:", error);
        }
      }
    }, 3000);

    // Stop polling after 24 hours (86400000 ms)
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      toast.error("Approval request expired. Please try logging in again.");
      router.push("/login");
    }, 86400000);

    // Track elapsed time
    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
      clearTimeout(timeoutId);
    };
  }, [userId, router]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <Vortex
      containerClassName="h-screen w-full overflow-hidden"
      className="flex items-center justify-center h-full"
      backgroundColor="black"
    >
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center">
            {isApproved
              ? "Approved!"
              : isDenied
              ? "Request Denied"
              : "Awaiting Approval"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {isApproved ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Account Approved!</p>
                <p className="text-sm text-muted-foreground">
                  Your Google account has been approved by an administrator.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
              </div>
            </>
          ) : isDenied ? (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold">Request Denied</p>
                <p className="text-sm text-muted-foreground">
                  Sorry, an administrator has denied your login request.
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                >
                  Back to Register
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Clock className="w-12 h-12 text-blue-500 animate-pulse" />
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Account Under Review</p>
                <p className="text-sm text-muted-foreground">
                  Your Google registration has been received.
                </p>
                <p className="text-sm text-muted-foreground">
                  An admin will review and approve your account shortly.
                </p>
              </div>

              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Email:</strong> {email}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Waiting for:</strong> {formatTime(elapsedTime)}
                </p>
              </div>

              <div className="w-full pt-2 border-t">
                <p className="text-xs text-center text-muted-foreground mt-4">
                  This page will automatically update when your account is
                  approved.
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  You can safely close this window or leave it open.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Vortex>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingApprovalContent />
    </Suspense>
  );
}
