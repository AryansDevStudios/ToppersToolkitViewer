
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ShieldAlert, Sparkles, User, Bot } from 'lucide-react';
import { getChatHistory } from '@/lib/data';
import { solveDoubt } from '@/ai/flows/doubt-solver-flow';
import type { ChatMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
            You do not have permission to use the AI Doubt Solver. Please contact an administrator to request access.
        </p>
    </div>
);

const Initializing = () => (
     <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Initializing Chat...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we check your permissions.</p>
    </div>
)

export default function SolveDoubtsPage() {
    const { user, role, hasAiAccess, loading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

     useEffect(() => {
        if (!authLoading && user) {
            const allowed = role === 'Admin' || hasAiAccess;
            setIsAllowed(allowed);
            if (allowed) {
                const fetchHistory = async () => {
                    const history = await getChatHistory(user.uid);
                    setMessages(history);
                };
                fetchHistory();
            }
        }
    }, [authLoading, user, role, hasAiAccess]);

     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !user) return;

        const userMessage: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await solveDoubt(input, user.uid);
            const modelMessage: ChatMessage = { role: 'model', content: response, timestamp: Date.now() };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching the response.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (authLoading || isAllowed === null) {
        return <Initializing />;
    }

    if (!isAllowed) {
        return <AccessDenied />;
    }

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <header className="mb-8 text-center">
                <div className="inline-block bg-primary/10 text-primary rounded-full p-3 mb-4">
                    <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    AI Doubt Solver
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                    Your personal AI tutor. Ask any academic question!
                </p>
            </header>

            <div className="flex-1 flex flex-col bg-card border rounded-lg overflow-hidden">
                <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
                     <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                {msg.role === 'model' && (
                                    <Avatar className="h-9 w-9 border-2 border-primary">
                                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xl p-3 rounded-xl prose dark:prose-invert prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2",
                                    msg.role === 'user'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.role === 'user' && (
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-9 w-9 border-2 border-primary">
                                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-3 rounded-xl flex items-center space-x-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                <div className="p-4 bg-background/50 border-t">
                     {error && <p className="text-destructive text-sm mb-2 text-center">{error}</p>}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your question here..."
                            className="flex-1 resize-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-auto w-10">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
