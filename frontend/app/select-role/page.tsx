"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

function SelectRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const setHasProfile = useAuthStore((state) => state.setHasProfile);

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  const email = searchParams.get("email") || "";

  useEffect(() => {
    // Verify we have the necessary parameters
    if (!token || !userId) {
      toast.error("Invalid session. Please try logging in again.");
      router.push("/login");
    }
  }, [token, userId, router]);

  const handleSubmit = async () => {
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/select-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set role");
      }

      // Login with the updated user data
      const userData = {
        id: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
      };
      
      login(userData, data.data.token);

      // Profile already exists from Google OAuth, so set hasProfile to true
      setHasProfile(true);

      toast.success(`Role set to ${role}. Welcome!`);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast.error(error.message || "Failed to set role");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !userId) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Select Your Role
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Welcome! Please select your role to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="ALUMNI">Alumni</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose your role. Note: Admin role requires approval and can only be assigned by existing admins.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !role}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting role...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SelectRolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SelectRoleContent />
    </Suspense>
  );
}
