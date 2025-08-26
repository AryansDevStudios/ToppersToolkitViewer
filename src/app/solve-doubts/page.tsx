'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles, User as UserIcon, ShieldAlert } from 'lucide-react';
import { solveDoubt } from '@/ai/flows/doubt-solver-flow';
import type { ChatMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DoubtSolverPage() {
  const { user, role, hasAiAccess, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const question = input;
    setInput('');

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: question, timestamp: Date.now() }]);

    startTransition(async () => {
      try {
        const updatedHistory = await solveDoubt(user.uid, question);
        setMessages(updatedHistory);
      } catch (error: any) {
        toast({
          title: "An error occurred",
          description: error.message || "Failed to get a response from the AI.",
          variant: "destructive",
        });
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.content !== question));
      }
    });
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (role !== 'Admin' && !hasAiAccess) {
     return (
       <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have permission to use the AI Doubt Solver.</p>
          <Button asChild className="mt-6">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <Card className="w-full max-w-3xl mx-auto flex flex-col flex-1">
        <CardHeader className="text-center">
          <div className="inline-block bg-primary/10 text-primary rounded-full p-3 mx-auto w-fit mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold">AI Doubt Solver</CardTitle>
          <CardDescription>Ask any question about your subjects, and I'll find the answer.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? "justify-end" : "justify-start")}>
                  {message.role === 'model' && (
                    <Avatar className="h-9 w-9 border">
                       <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl", message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback><UserIcon /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-9 w-9 border">
                       <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-muted rounded-bl-none flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleSubmit} className="w-full flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={isPending}
              autoFocus
            />
            <Button type="submit" disabled={isPending || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
