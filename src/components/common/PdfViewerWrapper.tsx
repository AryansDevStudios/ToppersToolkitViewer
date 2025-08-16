
"use client";

import { Loader2, Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const PDF_VIEWER_BASE_URL = "/PDFviewer/web/viewer.html";

export function PdfViewerWrapper({ url }: { url: string }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", onFullscreenChange);

        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);


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
        <div ref={containerRef} className="relative w-full h-full bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 z-10 bg-background/50 hover:bg-background/80"
                onClick={handleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            <iframe
                src={viewerUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
                allowFullScreen
            >
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground w-full h-[calc(100vh-12rem)] bg-background">
                    <Loader2 className="h-10 w-10 animate-spin mb-2" />
                    <p>Loading Viewer...</p>
                </div>
            </iframe>
        </div>
    );
}
