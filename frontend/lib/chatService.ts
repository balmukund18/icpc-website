import api from "./axios";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export async function sendChatMessage(prompt: string): Promise<string> {
    const response = await api.post("/ai/chat", { prompt });
    const data = response.data.data || response.data;
    if (data.error) {
        throw new Error(data.error);
    }
    return data.reply;
}
