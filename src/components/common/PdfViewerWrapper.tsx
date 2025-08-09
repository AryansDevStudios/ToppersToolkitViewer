
"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PdfViewer = dynamic(() => import('@/components/common/PdfViewer').then(mod => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground w-full h-[calc(100vh-12rem)] bg-background">
      <Loader2 className="h-10 w-10 animate-spin mb-2" />
      <p>Loading Viewer...</p>
    </div>
  ),
});

export function PdfViewerWrapper({ url }: { url: string }) {
    return <PdfViewer url={url} />;
}
