"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";


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

  useEffect(() => {
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

      const userData = {
        id: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
      };

      login(userData, data.data.token);
      setHasProfile(false);

      toast.success(`Role set to ${role}. Please complete your profile.`);
      router.push("/profile");
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="border border-border w-full max-w-md">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">&gt; select-role:</div>
          <p className="text-xl font-bold text-foreground">
            Select Your Role
          </p>
          <p className="text-sm text-muted-foreground">
            welcome! please select your role to continue.
          </p>
        </div>
        <div className="p-4 pt-0">
          <div className="space-y-2">
            <label className="text-sm font-medium">role:</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">student</SelectItem>
                <SelectItem value="ALUMNI">alumni</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              &gt; admin role requires approval from existing admins
            </p>
          </div>

          <button
            className="w-full text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors"
            onClick={handleSubmit}
            disabled={isLoading || !role}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                setting role...
              </>
            ) : (
              "[ CONTINUE ]"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectRolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">&gt; loading...</div>
        </div>
      }
    >
      <SelectRoleContent />
    </Suspense>
  );
}
