import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Folder, Eye } from "lucide-react";
import { findItemBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Badge } from "@/components/ui/badge";

export default function BrowsePage({ params }: { params: { slug: string[] } }) {
  const { slug } = params;
  const { current, parents } = findItemBySlug(slug);

  if (!current) {
    notFound();
  }

  const breadcrumbItems = parents.slice(1).map((p) => ({
    name: p.name,
    href: p.href,
  }));

  const isNote = "pdfUrl" in current;
  let children: any[] = [];
  if ("subSubjects" in current) children = current.subSubjects;
  else if ("chapters" in current) children = current.chapters;
  else if ("notes" in current) children = current.notes;

  const getIcon = (item: any) => {
    if (item.type) {
      return <FileText className="w-8 h-8 text-primary" />;
    }
    return <Folder className="w-8 h-8 text-primary" />;
  };

  const getHref = (itemId: string) => `/browse/${slug.join("/")}/${itemId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} currentPageName={current.name} />
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-2">{current.name}</h1>
        {isNote && (
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">{current.type}</Badge>
            <p className="text-muted-foreground">The final notes for this chapter.</p>
          </div>
        )}
      </header>

      {isNote ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>View Document</CardTitle>
            <CardDescription>
              This document is available for online viewing. Click the button below to open the PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-24 h-24 text-muted-foreground" />
            </div>
             <Button asChild className="w-full">
                <Link href={current.pdfUrl} target="_blank">
                    <Eye className="mr-2 h-4 w-4" /> View PDF
                </Link>
             </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((item) => (
            <Link
              key={item.id}
              href={getHref(item.id)}
              className="block"
            >
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {getIcon(item)}
                  </div>
                  <div>
                    <CardTitle className="font-headline text-xl">{item.name || item.title}</CardTitle>
                    {item.type && <Badge className="mt-1" variant="outline">{item.type}</Badge>}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
