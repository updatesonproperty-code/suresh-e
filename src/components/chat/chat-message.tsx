
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Loader2, ThumbsUp, ThumbsDown, RefreshCw, Clipboard, Volume2, Pencil } from "lucide-react";
import { useUser } from "@/lib/auth";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const user = useUser();
  const userRole = user?.role;

  const getInitials = () => {
    if (userRole === 'admin') return 'A';
    if (userRole === 'staff') return 'S';
    return 'U';
  }
  
  const formatContent = (content: string) => {
    return content
        .replace(/\n/g, '<br />')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/✅/g, '<span class="text-green-500">✅</span>')
        .replace(/❌/g, '<span class="text-red-500">❌</span>');
  }

  const AssistantMessage = () => (
     <div className="flex flex-col items-start gap-2">
        <div
            className="max-w-xl rounded-lg bg-muted/50 px-4 py-3"
        >
            {isLoading ? (
            <div className="flex items-center justify-center p-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            ) : (
            <div
                className="prose prose-sm max-w-none text-current whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            />
            )}
        </div>
        {!isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <button className="p-1 hover:text-foreground"><Clipboard size={16} /></button>
                <button className="p-1 hover:text-foreground"><ThumbsUp size={16} /></button>
                <button className="p-1 hover:text-foreground"><ThumbsDown size={16} /></button>
                <button className="p-1 hover:text-foreground"><Volume2 size={16} /></button>
                <button className="p-1 hover:text-foreground"><Pencil size={16} /></button>
                <button className="p-1 hover:text-foreground"><RefreshCw size={16} /></button>
            </div>
        )}
     </div>
  )

  const UserMessage = () => (
     <div className="flex items-start gap-4 justify-end">
        <div
            className="max-w-xl rounded-lg px-4 py-3 bg-primary text-primary-foreground"
        >
            <div
                className="prose prose-sm max-w-none text-current whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            />
        </div>
     </div>
  )

  return isUser ? <UserMessage /> : <AssistantMessage />;
}
