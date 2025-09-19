
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { getAllNotes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Loader2, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import { Badge } from '@/components/ui/badge';

type NoteItem = (Note & { subjectName: string; subSubjectName: string; chapter: string; slug: string });

const SearchResultCard = ({ note }: { note: NoteItem }) => {
    const Icon = (note.icon && iconMap[note.icon]) || FileText;
    return (
        <Link href={note.slug} className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {note.type}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {note.subjectName} &gt; {note.subSubjectName}
                    </p>
                    <p className="text-sm font-semibold">
                        Chapter: {note.chapter}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};


export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NoteItem[]>([]);
  const [allNotes, setAllNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const notes = await getAllNotes();
        setAllNotes(notes);
      } catch (error) {
        console.error("Failed to fetch notes for search:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const handleSearch = useCallback((currentQuery: string) => {
    setHasSearched(true);
    if (currentQuery.length > 1 && allNotes.length > 0) {
      const lowerCaseQuery = currentQuery.toLowerCase();
      const filtered = allNotes.filter(note => 
        note.type.toLowerCase().includes(lowerCaseQuery) ||
        note.chapter.toLowerCase().includes(lowerCaseQuery) ||
        note.subSubjectName.toLowerCase().includes(lowerCaseQuery) ||
        note.subjectName.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [allNotes]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      handleSearch(newQuery);
  };

  return (
    <div className="w-full">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            value={query}
            onChange={handleInputChange}
            placeholder="Search notes by title, chapter, subject..."
            className="w-full pl-10 h-12 text-base"
            disabled={loading}
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>

        <div className="mt-8">
            {hasSearched ? (
                 results.length > 0 ? (
                    <div className="space-y-4">
                         <h2 className="text-lg font-semibold">{results.length} result(s) found</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map(note => <SearchResultCard key={note.id} note={note} />)}
                         </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <h3 className="text-xl font-semibold">No results found</h3>
                        <p>Try searching for something else.</p>
                    </div>
                )
            ) : (
                !loading && (
                    <div className="text-center py-16 text-muted-foreground">
                        <h3 className="text-xl font-semibold">Search for Notes</h3>
                        <p>Enter a query above to find notes, chapters, or subjects.</p>
                    </div>
                )
            )}
        </div>
    </div>
  );
}
