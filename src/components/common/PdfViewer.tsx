
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number | undefined, height: number | undefined }>({ width: undefined, height: undefined });
  const [scale, setScale] = useState(1);
  const initialPinchDistance = useRef<number | null>(null);

  const onDocumentLoadSuccess = useCallback(async (pdf: any) => {
    setNumPages(pdf.numPages);
    const firstPage = await pdf.getPage(1);
    const { width: pageWidth, height: pageHeight } = firstPage.getViewport({ scale: 1 });

    if (carouselContainerRef.current) {
      const { clientWidth: containerWidth, clientHeight: containerHeight } = carouselContainerRef.current;
      
      const containerRatio = containerWidth / containerHeight;
      const pageRatio = pageWidth / pageHeight;

      if (pageRatio > containerRatio) {
        setPageDimensions({ width: containerWidth, height: undefined });
      } else {
        setPageDimensions({ width: undefined, height: containerHeight });
      }
    }
  }, []);

  const resetPageDimensions = useCallback(() => {
    // This triggers a re-calculation of dimensions based on the new container size
    setPageDimensions({ width: undefined, height: undefined });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resetPageDimensions);
    return () => {
      window.removeEventListener('resize', resetPageDimensions);
    };
  }, [resetPageDimensions]);
  
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
      // Ctrl + Scroll for zooming
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.1;
        const newScale = e.deltaY > 0 ? scale - zoomFactor : scale + zoomFactor;
        setScale(Math.max(0.5, Math.min(newScale, 3))); // Clamp scale between 0.5x and 3x
        return;
      }
      
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
      }, 50); // Debounce to prevent overly sensitive scrolling
    };

    const getDistance = (touches: TouchList) => {
        return Math.sqrt(
            Math.pow(touches[0].clientX - touches[1].clientX, 2) +
            Math.pow(touches[0].clientY - touches[1].clientY, 2)
        );
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialPinchDistance.current = getDistance(e.touches);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistance.current !== null) {
            e.preventDefault();
            const newDistance = getDistance(e.touches);
            const delta = newDistance / initialPinchDistance.current;
            setScale(prevScale => Math.max(0.5, Math.min(prevScale * delta, 3)));
            initialPinchDistance.current = newDistance;
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
            initialPinchDistance.current = null;
        }
    };
    
    const carouselEl = carouselContainerRef.current;
    if (carouselEl) {
        carouselEl.addEventListener('wheel', handleWheel, { passive: false });
        carouselEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        carouselEl.addEventListener('touchmove', handleTouchMove, { passive: false });
        carouselEl.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (carouselEl) {
          carouselEl.removeEventListener('wheel', handleWheel);
          carouselEl.removeEventListener('touchstart', handleTouchStart);
          carouselEl.removeEventListener('touchmove', handleTouchMove);
          carouselEl.removeEventListener('touchend', handleTouchEnd);
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
                              scale={scale}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
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
