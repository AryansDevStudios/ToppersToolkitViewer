
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Configure the worker to load from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);
  
  function onDocumentLoadError(error: Error) {
    console.error("Failed to load PDF:", error);
    setError("Failed to load PDF file. Please check the URL and CORS settings.");
  }
  
  useEffect(() => {
    if (!api) return;
 
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.1;
        const newScale = e.deltaY > 0 ? scale - zoomFactor : scale + zoomFactor;
        setScale(Math.max(0.5, Math.min(newScale, 3)));
        return;
      }
      
      if (!api || e.deltaX !== 0) return;

      const canScrollPrev = api.canScrollPrev();
      const canScrollNext = api.canScrollNext();
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;

      if ((isScrollingDown && canScrollNext) || (isScrollingUp && canScrollPrev)) {
         e.preventDefault();
      } else {
          return;
      }
      
      if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
          if (isScrollingDown) {
              if (canScrollNext) api.scrollNext();
          } else if (isScrollingUp) {
              if(canScrollPrev) api.scrollPrev();
          }
      }, 50);
    };
    
    const carouselEl = carouselContainerRef.current;
    if (carouselEl) {
        carouselEl.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (carouselEl) {
          carouselEl.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
      }
    }
  }, [api, scale]);

  useEffect(() => {
    if (!api) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        api.scrollNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        api.scrollPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [api]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full h-full flex-1 overflow-hidden flex justify-center items-center" ref={carouselContainerRef}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p>Loading PDF...</p>
            </div>
          }
          error={
             <div className="flex flex-col items-center justify-center h-full text-destructive p-4 text-center">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p className='font-semibold'>Error</p>
              <p className="text-sm">{error || "An unknown error occurred."}</p>
            </div>
          }
        >
            {numPages && (
                 <Carousel setApi={setApi} className="w-full h-full">
                    <CarouselContent>
                      {Array.from(new Array(numPages), (el, index) => (
                        <CarouselItem key={`page_${index + 1}`} className="overflow-auto">
                          <div 
                            className="flex items-center justify-center h-full"
                            style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.2s ease-in-out' }}
                          >
                            <Page
                              pageNumber={index + 1}
                              renderAnnotationLayer={true}
                              renderTextLayer={true}
                              className="shadow-lg"
                              canvasBackground="transparent"
                              height={carouselContainerRef.current ? carouselContainerRef.current.clientHeight * 0.9 : undefined}
                              onRenderError={() => {}}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10" />
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}>
                                <ZoomOut className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Zoom Out</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                             <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(1)}>
                                <RotateCw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Reset Zoom</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                             <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(prev => Math.min(3, prev + 0.2))}>
                                <ZoomIn className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Zoom In</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <p className="text-sm font-medium text-muted-foreground w-24 text-center">
                            Page {current} of {count}
                        </p>
                    </div>
                  </Carousel>
            )}
        </Document>
      </div>
    </div>
  );
}

    