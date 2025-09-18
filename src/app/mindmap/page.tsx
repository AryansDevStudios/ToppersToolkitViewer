
import { getAllNotes } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { iconMap } from '@/lib/iconMap';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export const revalidate = 0;

export default async function MindmapPage() {
  const allNotes = await getAllNotes();
  const mindmapNotes = allNotes.filter(note => 
    note.type.toLowerCase().includes('mindmap')
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <BrainCircuit className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Mind Maps
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visualize complex topics with our collection of mind maps.
        </p>
      </header>
      <main className="max-w-6xl mx-auto">
        {mindmapNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mindmapNotes.map((note) => {
              const Icon = (note.icon && iconMap[note.icon]) || FileText;
              return (
                <Link href={note.slug} key={note.id} className="block group">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary">{note.subjectName}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full pt-0">
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {note.chapter}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-1">
                        {note.subSubjectName}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Mind Maps Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                It looks like no mind maps have been uploaded yet. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
