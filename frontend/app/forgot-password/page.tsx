"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Vortex } from "@/components/ui/vortex";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                setSent(true);
                toast.success("Reset link sent! Check your email.");
            } else {
                toast.error(data.error || "Failed to send reset link");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Vortex
            containerClassName="h-screen w-full overflow-hidden"
            className="flex items-center justify-center h-full"
            backgroundColor="black"
        >
            <Card className="w-87.5">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        Forgot Password
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {sent
                            ? "Check your email for the reset link"
                            : "Enter your email to receive a password reset link"}
                    </p>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    If an account exists for <strong className="text-foreground">{email}</strong>,
                                    you&apos;ll receive a password reset link shortly.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSent(false);
                                        setEmail("");
                                    }}
                                    className="w-full"
                                >
                                    Try another email
                                </Button>
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                            <Link href="/login" className="block">
                                <Button variant="ghost" className="w-full gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </Vortex>
    );
}
