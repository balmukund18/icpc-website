"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
    X,
    Loader2,
    Maximize2,
    Minimize2,
    RotateCcw,
} from "lucide-react";
import { sendChatMessage, ChatMessage } from "@/lib/chatService";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
    "Explain two pointers technique",
    "How to approach DP problems?",
    "Time complexity of merge sort",
    "Tips for ICPC contest prep",
];

type WidgetSize = "default" | "expanded" | "fullscreen";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [size, setSize] = useState<WidgetSize>("default");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (size === "fullscreen") setSize("expanded");
                else if (size === "expanded") setSize("default");
                else setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [size]);

    const handleSend = useCallback(
        async (text?: string) => {
            const prompt = text || input.trim();
            if (!prompt || loading) return;

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: prompt,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setLoading(true);

            try {
                const reply = await sendChatMessage(prompt);
                const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: reply,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } catch (error: unknown) {
                const err = error as {
                    response?: { data?: { error?: string } };
                    message?: string;
                };
                const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        err.response?.data?.error ||
                        err.message ||
                        "Sorry, something went wrong. Please try again.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } finally {
                setLoading(false);
            }
        },
        [input, loading]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const cycleSize = () => {
        if (size === "default") setSize("expanded");
        else if (size === "expanded") setSize("fullscreen");
        else setSize("default");
    };

    const handleClearChat = () => { setMessages([]); };

    // Size classes — sharp corners, terminal style
    const sizeClasses: Record<WidgetSize, string> = {
        default: "left-3 right-3 bottom-3 sm:left-auto sm:w-[400px] max-h-[85vh] sm:max-h-[500px] sm:bottom-6 sm:right-6",
        expanded: "left-3 right-3 bottom-3 sm:left-auto sm:w-[520px] max-h-[90vh] sm:max-h-[700px] sm:bottom-6 sm:right-6",
        fullscreen: "inset-2 sm:inset-4 md:inset-6 lg:inset-10 w-auto max-h-none",
    };

    const messageAreaClasses: Record<WidgetSize, string> = {
        default: "min-h-[260px] max-h-[340px]",
        expanded: "min-h-[400px] max-h-[520px]",
        fullscreen: "min-h-0 flex-1",
    };

    // Floating terminal button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-12 w-12 border border-border bg-background text-foreground hover:bg-muted hover:border-foreground transition-all duration-200 flex items-center justify-center group shadow-lg"
                aria-label="Open AI Chat"
            >
                <span className="font-mono text-sm font-bold group-hover:text-[#3FB950] transition-colors">&gt;_</span>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-[#3FB950] border border-background animate-pulse" />
            </button>
        );
    }

    return (
        <>
            {/* Backdrop for fullscreen */}
            {size === "fullscreen" && (
                <div
                    className="fixed inset-0 z-40 bg-black/60"
                    onClick={() => setSize("expanded")}
                />
            )}

            <div
                className={`fixed z-50 flex flex-col border border-border bg-background shadow-2xl overflow-hidden transition-all duration-200 ${sizeClasses[size]}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="text-[#3FB950] font-mono text-sm font-bold">&gt;_</span>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate font-mono">
                                ai_assistant
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-mono">powered by groq</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearChat}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                                title="Clear chat"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={cycleSize}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                            title={size === "fullscreen" ? "Minimize" : size === "expanded" ? "Full screen" : "Expand"}
                        >
                            {size === "fullscreen" ? (
                                <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                                <Maximize2 className="h-3.5 w-3.5" />
                            )}
                        </button>
                        <button
                            onClick={() => { setIsOpen(false); setSize("default"); }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                            title="Close"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 ${messageAreaClasses[size]}`}
                    style={{ scrollbarWidth: "thin" }}
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="text-[#3FB950] font-mono text-2xl mb-3">&gt;_</div>
                            <p className="text-sm text-foreground font-mono mb-1">
                                icpc_ai_assistant
                            </p>
                            <p className="text-xs text-muted-foreground mb-5 max-w-[260px]">
                                ask about algorithms, data structures, or contest prep
                            </p>
                            <div
                                className={`grid gap-2 w-full max-w-sm ${size === "fullscreen" ? "grid-cols-4" : "grid-cols-2"}`}
                            >
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        className="text-left text-[11px] px-3 py-2.5 bg-muted/30 text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors leading-tight font-mono"
                                    >
                                        &gt; {s.toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="space-y-0.5">
                                <p className="text-[10px] font-mono text-muted-foreground">
                                    {msg.role === "user" ? "[user]" : "[ai]"}{" "}
                                    {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                                <div
                                    className={`text-sm leading-relaxed overflow-hidden ${msg.role === "user"
                                        ? "text-foreground pl-3 border-l-2 border-l-[#58A6FF]"
                                        : "text-foreground pl-3 border-l-2 border-l-[#3FB950]"
                                        }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div className="prose dark:prose-invert prose-sm max-w-none break-words [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:mt-3 [&>h2]:mt-2.5 [&>h3]:mt-2 [&>pre]:my-2 [&>pre]:bg-muted [&>pre]:border [&>pre]:border-border [&>pre]:p-3 [&>pre]:overflow-x-auto [&>pre]:text-xs [&_code]:text-[#58A6FF] [&_code]:text-xs [&>p>code]:bg-muted [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:text-[11px] [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <span className="break-words">{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-mono text-muted-foreground">[ai] processing...</p>
                            <div className="pl-3 border-l-2 border-l-[#3FB950] py-1">
                                <div className="flex gap-1.5">
                                    <span className="h-1.5 w-1.5 bg-[#3FB950] animate-pulse [animation-delay:0ms]" />
                                    <span className="h-1.5 w-1.5 bg-[#3FB950] animate-pulse [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 bg-[#3FB950] animate-pulse [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 border-t border-border bg-muted/80 shrink-0">
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-[#3FB950] font-mono text-sm shrink-0">&gt;</span>
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="ask about algorithms, DSA..."
                                className="bg-transparent border-none text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono h-8 px-0"
                                disabled={loading}
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-muted hover:border-foreground transition-colors disabled:opacity-30 shrink-0 font-mono"
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                "SEND"
                            )}
                        </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 text-center mt-1.5 font-mono">
                        esc {size === "fullscreen" ? "shrink" : "close"} · click expand to resize
                    </p>
                </div>
            </div>
        </>
    );
}
