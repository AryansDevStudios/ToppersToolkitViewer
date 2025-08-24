"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { solveDoubt } from "@/ai/flows/doubt-solver-flow";
import ReactMarkdown from 'react-markdown';

export default function DoubtSolverPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse("");

    try {
      // The flow is called with the named parameter `prompt`
      const result = await solveDoubt({ prompt });
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Sparkles className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          AI Doubt Solver
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Stuck on a problem? Ask our AI assistant for a step-by-step solution.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Enter your academic question below. Be as specific as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Explain Newton's third law of motion with an example."
              rows={5}
              className="text-base"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Solve Doubt
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-base">
             <ReactMarkdown>{response}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
