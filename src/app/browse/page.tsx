

"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllNotes, getUserById } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import type { Note } from '@/lib/types';
import { iconMap } from '@/lib/iconMap';

type NoteItem = (Note & { subject: string; chapter: string; chapterId: string; slug: string });

export default function BrowseAllNotesPage() {
  const [allNotes, setAllNotes] = useState<NoteItem[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteItem[]>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchNotes() {
      setIsLoading(true);
      const notes = await getAllNotes();
      const sortedNotes = notes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllNotes(sortedNotes);
      setIsLoading(false);
    }
    fetchNotes();
  }, []);

  useEffect(() => {
    async function filterAndSetNotes() {
      if (authLoading || isLoading) return;

      if (role === 'Admin' || showAllNotes) {
        setFilteredNotes(allNotes);
        return;
      }
      
      if (user) {
        // Since allNotes are already loaded, we don't need to set loading here
        // unless fetching userData is slow, which it shouldn't be.
        const userData = await getUserById(user.uid);
        const grantedNoteIds = new Set(userData?.noteAccess || []);
        const granted = allNotes.filter(note => grantedNoteIds.has(note.id));
        setFilteredNotes(granted);
      } else {
        // If not logged in and not showing all, show nothing.
        setFilteredNotes([]);
      }
    }
    filterAndSetNotes();
  }, [showAllNotes, user, role, allNotes, authLoading, isLoading]);

  const displayLoading = authLoading || isLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-headline">
          Latest Notes
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse all available notes, or filter to see only those you can access.
        </p>
      </header>

      {user && role !== 'Admin' && (
        <div className="flex items-center justify-end space-x-3 mb-8 p-4 border rounded-lg bg-card">
          <Label htmlFor="all-notes-toggle" className="font-semibold">Show All Notes</Label>
          <Switch
            id="all-notes-toggle"
            checked={showAllNotes}
            onCheckedChange={setShowAllNotes}
          />
        </div>
      )}

      {displayLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => {
            const Icon = (note.icon && iconMap[note.icon]) || FileText;
            return (
                <Link href={note.slug} key={note.id} className="block group">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary">{note.subject}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full pt-0">
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {note.type}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-1">
                        Chapter: {note.chapter}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">
            {showAllNotes ? "No Notes Yet" : "No Notes Found"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {showAllNotes
              ? "Looks like no notes have been uploaded. Check back soon!"
              : "You have not been granted access to any notes yet. Turn on 'Show All Notes' to browse everything."}
          </p>
        </div>
      )}
    </div>
  );
}
