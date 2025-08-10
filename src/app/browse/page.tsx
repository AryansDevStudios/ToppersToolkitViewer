
import Link from 'next/link';
import { getAllNotes } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function BrowseAllNotesPage() {
  const allNotes = await getAllNotes();
  const sortedNotes = allNotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-headline">
          Latest Notes
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse all available notes, with the newest uploads appearing first.
        </p>
      </header>

      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedNotes.map((note) => (
            <Link href={note.slug} key={note.id} className="block group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{note.subject}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {note.type}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-1">
                    Chapter: {note.chapter}
                  </p>
                   {note.createdAt && (
                     <p className="text-xs text-muted-foreground mt-auto pt-4">
                       Uploaded on {format(new Date(note.createdAt), 'PPP')}
                     </p>
                   )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No Notes Yet</h2>
          <p className="text-muted-foreground">
            Looks like no notes have been uploaded. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
