"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MessageSquare,
    X,
    Send,
    Loader2,
    Bot,
    User,
    Sparkles,
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    const handleClearChat = () => {
        setMessages([]);
    };

    // Size classes
    const sizeClasses: Record<WidgetSize, string> = {
        default: "w-[380px] max-h-[500px] bottom-6 right-6 rounded-2xl",
        expanded: "w-[520px] max-h-[700px] bottom-6 right-6 rounded-2xl",
        fullscreen:
            "inset-4 sm:inset-6 md:inset-10 lg:inset-16 w-auto max-h-none rounded-2xl",
    };

    const messageAreaClasses: Record<WidgetSize, string> = {
        default: "min-h-[260px] max-h-[340px]",
        expanded: "min-h-[400px] max-h-[520px]",
        fullscreen: "min-h-0 flex-1",
    };

    // Floating button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
                aria-label="Open AI Chat"
            >
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
            </button>
        );
    }

    return (
        <>
            {/* Backdrop for fullscreen */}
            {size === "fullscreen" && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSize("expanded")}
                />
            )}

            <div
                className={`fixed z-50 flex flex-col border border-gray-700/50 bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300 ease-in-out ${sizeClasses[size]}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-gray-700/50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">
                                ICPC AI Assistant
                            </h3>
                            <p className="text-[10px] text-gray-400">Powered by Groq</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClearChat}
                                className="h-7 w-7 text-gray-400 hover:text-white"
                                title="Clear chat"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={cycleSize}
                            className="h-7 w-7 text-gray-400 hover:text-white"
                            title={
                                size === "fullscreen"
                                    ? "Minimize"
                                    : size === "expanded"
                                        ? "Full screen"
                                        : "Expand"
                            }
                        >
                            {size === "fullscreen" ? (
                                <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                                <Maximize2 className="h-3.5 w-3.5" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsOpen(false);
                                setSize("default");
                            }}
                            className="h-7 w-7 text-gray-400 hover:text-white"
                            title="Close"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    className={`flex-1 overflow-y-auto px-4 py-3 space-y-4 ${messageAreaClasses[size]}`}
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#4b5563 transparent",
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                                <Bot className="h-7 w-7 text-purple-400" />
                            </div>
                            <p className="text-sm text-gray-300 font-medium mb-1">
                                Hi! I&apos;m your ICPC AI assistant
                            </p>
                            <p className="text-xs text-gray-500 mb-5 max-w-[260px]">
                                Ask me about algorithms, data structures, or contest prep
                            </p>
                            <div
                                className={`grid gap-2 w-full max-w-sm ${size === "fullscreen" ? "grid-cols-4" : "grid-cols-2"}`}
                            >
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        className="text-left text-[11px] px-3 py-2.5 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50 transition-colors leading-tight"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "user" ? "bg-purple-500/20" : "bg-gray-700/50"
                                        }`}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-3.5 w-3.5 text-purple-400" />
                                    ) : (
                                        <Bot className="h-3.5 w-3.5 text-indigo-400" />
                                    )}
                                </div>
                                <div
                                    className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed overflow-hidden ${msg.role === "user"
                                            ? "bg-purple-600/30 text-white max-w-[75%]"
                                            : "bg-gray-800/80 text-gray-200 max-w-[85%]"
                                        }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div className="prose prose-invert prose-sm max-w-none break-words [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:mt-3 [&>h2]:mt-2.5 [&>h3]:mt-2 [&>pre]:my-2 [&>pre]:bg-gray-900/80 [&>pre]:border [&>pre]:border-gray-700/50 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:overflow-x-auto [&>pre]:text-xs [&_code]:text-purple-300 [&_code]:text-xs [&>p>code]:bg-gray-900/60 [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded [&>p>code]:text-[11px] [&_pre_code]:bg-transparent [&_pre_code]:p-0">
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
                        <div className="flex gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-gray-700/50 flex items-center justify-center shrink-0">
                                <Bot className="h-3.5 w-3.5 text-indigo-400" />
                            </div>
                            <div className="bg-gray-800/80 rounded-xl px-4 py-3">
                                <div className="flex gap-1.5">
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 border-t border-gray-700/50 bg-gray-900/80 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about algorithms, DSA..."
                            className="bg-gray-800/60 border-gray-700/50 text-sm placeholder:text-gray-500 focus-visible:ring-purple-500/30"
                            disabled={loading}
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            size="icon"
                            className="bg-purple-600 hover:bg-purple-700 shrink-0 h-9 w-9"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-[9px] text-gray-600 text-center mt-1.5">
                        Press Esc to {size === "fullscreen" ? "shrink" : "close"} · Click
                        expand to resize
                    </p>
                </div>
            </div>
        </>
    );
}
