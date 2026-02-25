"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="border border-border w-full max-w-sm">
                <div className="p-4">
                    <div className="text-sm text-muted-foreground">&gt; forgot-password:</div>
                    <p className="text-xl font-bold text-foreground">
                        Reset Password
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {sent
                            ? "check your email for the reset link"
                            : "enter your email to receive a reset link"}
                    </p>
                </div>
                <div className="p-4 pt-0">
                    {sent ? (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 border border-[#3FB950]/30 bg-[#3FB950]/10 flex items-center justify-center rounded-sm">
                                    <CheckCircle className="h-6 w-6 text-[#3FB950]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    if an account exists for <strong className="text-foreground">{email}</strong>,
                                    you&apos;ll receive a reset link shortly.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    link expires in 1 hour. check spam folder.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="w-full text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => {
                                        setSent(false);
                                        setEmail("");
                                    }}
                                >
                                    try another email
                                </button>
                                <Link href="/login" className="w-full">
                                    <button className="inline-flex items-center gap-2 w-full text-sm px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                                        <ArrowLeft className="h-4 w-4" />
                                        back to login
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">email:</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button
                                className="w-full text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        sending...
                                    </>
                                ) : (
                                    "[ SEND RESET LINK ]"
                                )}
                            </button>
                            <Link href="/login" className="block">
                                <button className="inline-flex items-center gap-2 w-full text-sm px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    back to login
                                </button>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
