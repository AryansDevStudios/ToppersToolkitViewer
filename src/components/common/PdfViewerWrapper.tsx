
"use client";

import { Loader2 } from "lucide-react";

const PDF_VIEWER_BASE_URL = "/PDFviewer/web/viewer.html";

export function PdfViewerWrapper({ url }: { url: string }) {
    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground w-full h-[calc(100vh-12rem)] bg-background">
                <p>No PDF URL provided.</p>
            </div>
        );
    }

    // Construct the viewer URL with the PDF file as a parameter
    const viewerUrl = `${PDF_VIEWER_BASE_URL}?file=${encodeURIComponent(url)}`;

    return (
        <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
        >
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground w-full h-[calc(100vh-12rem)] bg-background">
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <p>Loading Viewer...</p>
             </div>
        </iframe>
    );
}
