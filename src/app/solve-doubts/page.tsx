'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User, Bot, Send, ShieldAlert, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { solveDoubt } from '@/ai/flows/doubt-solver-flow';
import type { ChatMessage } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Message = ({ message, userName }: { message: ChatMessage, userName: string }) => {
  const isModel = message.role === 'model';
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex items-start gap-3 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-lg rounded-lg px-4 py-3 ${
          isModel
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
       {!isModel && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};


export default function SolveDoubtsPage() {
  const { user, role, hasAiAccess, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const canUseFeature = !authLoading && user && (role === 'Admin' || hasAiAccess);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!canUseFeature) {
        // Render access denied message, so no redirect needed
      }
    }
  }, [user, authLoading, router, canUseFeature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending || !user) return;

    const question = input;
    setInput('');
    setError(null);
    
    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: question, timestamp: Date.now() }]);

    startTransition(async () => {
      try {
        const updatedHistory = await solveDoubt(user.uid, question);
        setMessages(updatedHistory);
      } catch (err: any) {
        console.error("Doubt Solver Error:", err);
        const errorMessage = err.message || JSON.stringify(err, null, 2);
        setError(`Sorry, an error occurred. Please try again.\n\nDetails: ${errorMessage}`);
        // Remove optimistic message on error
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);


  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canUseFeature) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to use the AI Doubt Solver.
        </p>
        <Button asChild className="mt-6">
          <a href="mailto:kuldeepsingh012011@gmail.com">Contact Support</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 h-[calc(100vh-4rem)] flex flex-col">
       <Card className="flex-1 flex flex-col h-full">
         <CardHeader className="text-center">
           <div className="inline-block mx-auto bg-primary/10 text-primary rounded-full p-3 mb-2 w-fit">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold">AI Doubt Solver</CardTitle>
            <CardDescription>
              Ask any question about your subjects, and I'll find the answer in your notes.
            </CardDescription>
         </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <Message key={index} message={msg} userName={user?.displayName || 'User'} />
              ))}
            </div>
          </ScrollArea>
           {error && (
            <div className="rounded-lg border bg-destructive/10 p-3 text-sm text-destructive">
              <pre className="whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about physics, history, etc..."
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" disabled={!input.trim() || isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
       </Card>
    </div>
  );
}
