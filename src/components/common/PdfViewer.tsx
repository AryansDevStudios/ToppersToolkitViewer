
"use client";

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import React from 'react';

// Configure the worker to load from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [error, setError] = useState<string | null>(null);
  const carouselContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number | undefined, height: number | undefined }>({ width: undefined, height: undefined });


  const handleResize = useCallback(() => {
    // This function will be called on window resize to trigger a re-render
    // and recalculate page dimensions.
    setPageDimensions({ width: undefined, height: undefined });
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);


  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    });

    const handleWheel = (e: WheelEvent) => {
        if (!api) return;

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
        }, 50); // A short delay to debounce
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

  }, [api])

   React.useEffect(() => {
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

  const onDocumentLoadSuccess = async (pdf: any) => {
    setNumPages(pdf.numPages);
    const firstPage = await pdf.getPage(1);
    const { width: pageWidth, height: pageHeight } = firstPage.getViewport({ scale: 1 });

    if (carouselContainerRef.current) {
      const { clientWidth: containerWidth, clientHeight: containerHeight } = carouselContainerRef.current;
      
      const containerRatio = containerWidth / containerHeight;
      const pageRatio = pageWidth / pageHeight;

      if (pageRatio > containerRatio) {
        // Page is wider than container, fit to width
        setPageDimensions({ width: containerWidth, height: undefined });
      } else {
        // Page is taller than container, fit to height
        setPageDimensions({ width: undefined, height: containerHeight });
      }
    }
  };
  
  function onDocumentLoadError(error: Error) {
    console.error("Failed to load PDF:", error);
    setError("Failed to load PDF file. Please check the URL and CORS settings.");
  }


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/20 p-4" ref={carouselContainerRef}>
      <div className="w-full h-full flex-1 overflow-hidden flex justify-center items-center">
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
                        <CarouselItem key={`page_${index + 1}`}>
                          <div className="flex items-center justify-center h-full">
                            <Page
                              pageNumber={index + 1}
                              renderAnnotationLayer={true}
                              renderTextLayer={true}
                              className="shadow-lg"
                              canvasBackground="transparent"
                              width={pageDimensions.width}
                              height={pageDimensions.height}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border flex items-center gap-2">
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
