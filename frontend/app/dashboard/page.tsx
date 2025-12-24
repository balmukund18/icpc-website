"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </CardContent>
        </Card>

        {/* Add more cards for Contests, Tasks, etc. */}
        <Card>
          <CardHeader>
            <CardTitle>Contests</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View upcoming contests</p>
            <Button className="mt-2" variant="outline">
              View All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Check your assignments</p>
            <Button className="mt-2" variant="outline">
              View All
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
