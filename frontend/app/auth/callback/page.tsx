"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const login = useAuthStore((state) => state.login);
  const setHasProfile = useAuthStore((state) => state.setHasProfile);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");

        if (!token || !userId) {
          setStatus("error");
          toast.error("Authentication failed: Missing token or user ID");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        // Store token temporarily to make API calls
        const tempUser = {
          id: userId,
          email: "",
          role: "STUDENT",
        };
        login(tempUser, token);

        // Fetch user profile to get email and role
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const profileData = data.data;

            // Update with full user info from backend
            const fullUser = {
              id: userId,
              email: profileData.user?.email || "",
              role: profileData.user?.role || "STUDENT",
            };
            login(fullUser, token);
            setHasProfile(true);

            toast.success("Logged in successfully with Google");
            router.push("/dashboard");
          } else {
            // Profile doesn't exist, redirect to create one
            setHasProfile(false);
            toast.success(
              "Logged in successfully with Google. Please complete your profile."
            );
            router.push("/profile");
          }
        } catch {
          // If profile fetch fails, still allow login but redirect to profile
          setHasProfile(false);
          toast.success(
            "Logged in successfully with Google. Please complete your profile."
          );
          router.push("/profile");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        toast.error("Authentication failed");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    processCallback();
  }, [searchParams, login, setHasProfile, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-100">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading"
              ? "Authenticating..."
              : "Authentication Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {status === "loading" ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  Please wait while we complete your Google sign-in...
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login page...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
