
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getAllNotes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

type NoteItem = (Note & { subjectName: string; subSubjectName: string; chapter: string; slug: string });

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NoteItem[]>([]);
  const [allNotes, setAllNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (query.length > 1 && allNotes.length > 0) {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = allNotes.filter(note => 
        note.type.toLowerCase().includes(lowerCaseQuery) ||
        note.chapter.toLowerCase().includes(lowerCaseQuery) ||
        note.subSubjectName.toLowerCase().includes(lowerCaseQuery) ||
        note.subjectName.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filtered.slice(0, 10)); // Limit to top 10 results
      if (!isOpen) setIsOpen(true);
    } else {
      setResults([]);
      if (isOpen) setIsOpen(false);
    }
  }, [query, allNotes, isOpen]);
  
  const handleSelect = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      inputRef.current?.blur();
    }
  }

  const handleInputFocus = () => {
    if(query.length > 1) {
      setIsOpen(true);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild className="w-full">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onFocus={handleInputFocus}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes by title, chapter, subject..."
              className="w-full pl-10"
              disabled={loading}
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {results.length > 0 ? (
          <div className="py-2">
             <p className="text-xs font-semibold px-3 py-1 text-muted-foreground">Top Results</p>
              {results.map(note => (
                <Link href={note.slug} key={note.id} onClick={handleSelect} className="block">
                    <div className="px-3 py-2 hover:bg-accent cursor-pointer">
                        <p className="font-semibold text-sm">{note.type}</p>
                        <p className="text-xs text-muted-foreground">
                            {note.subjectName} > {note.subSubjectName} > {note.chapter}
                        </p>
                    </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {query.length > 1 ? 'No results found.' : 'Type to search...'}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
