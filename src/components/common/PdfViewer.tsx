
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Expand, Grab } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

const PageContainer = ({ children, scale }: { children: React.ReactNode, scale: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeft = useRef(0);
    const scrollTop = useRef(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1) return;
        isPanning.current = true;
        startX.current = e.pageX - containerRef.current!.offsetLeft;
        startY.current = e.pageY - containerRef.current!.offsetTop;
        scrollLeft.current = containerRef.current!.scrollLeft;
        scrollTop.current = containerRef.current!.scrollTop;
        containerRef.current!.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
        isPanning.current = false;
        containerRef.current!.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
        isPanning.current = false;
        containerRef.current!.style.cursor = 'grab';
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current!.offsetLeft;
        const y = e.pageY - containerRef.current!.offsetTop;
        const walkX = (x - startX.current) * 2;
        const walkY = (y - startY.current) * 2;
        containerRef.current!.scrollLeft = scrollLeft.current - walkX;
        containerRef.current!.scrollTop = scrollTop.current - walkY;
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (scale <= 1 || e.touches.length !== 1) return;
        isPanning.current = true;
        startX.current = e.touches[0].pageX - containerRef.current!.offsetLeft;
        startY.current = e.touches[0].pageY - containerRef.current!.offsetTop;
        scrollLeft.current = containerRef.current!.scrollLeft;
        scrollTop.current = containerRef.current!.scrollTop;
    };

    const handleTouchEnd = () => {
        isPanning.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isPanning.current || e.touches.length !== 1) return;
        e.preventDefault();
        const x = e.touches[0].pageX - containerRef.current!.offsetLeft;
        const y = e.touches[0].pageY - containerRef.current!.offsetTop;
        const walkX = (x - startX.current) * 2;
        const walkY = (y - startY.current) * 2;
        containerRef.current!.scrollLeft = scrollLeft.current - walkX;
        containerRef.current!.scrollTop = scrollTop.current - walkY;
    };


    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full overflow-auto no-scrollbar",
                scale > 1 && "cursor-grab"
            )}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            {children}
        </div>
    );
};


export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);
  
  function onDocumentLoadError(error: Error) {
    setError("Failed to load PDF file. Please check the URL and CORS settings.");
  }
  
  const handleFullscreen = () => {
    const elem = carouselContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!api) return;
 
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setScale(1); // Reset scale on page change
    });

  }, [api]);


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/20" ref={carouselContainerRef}>
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
                 <Carousel setApi={setApi} className="w-full h-full" opts={{watchDrag: false}}>
                    <CarouselContent>
                      {Array.from(new Array(numPages), (el, index) => (
                        <CarouselItem key={`page_${index + 1}`}>
                          <PageContainer scale={scale}>
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
                                onRenderError={(error) => {
                                  if (error.name === 'AbortException') {
                                      return; // Ignore benign cancellation errors
                                  }
                                }}
                              />
                            </div>
                          </PageContainer>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border flex items-center gap-1 md:gap-2">
                        <TooltipProvider>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => api?.scrollPrev()} disabled={!api?.canScrollPrev()}>
                                <ChevronLeft className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Previous Page</p></TooltipContent>
                          </Tooltip>

                          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}>
                                <ZoomOut className="w-5 h-5" />
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
                                <ZoomIn className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Zoom In</p></TooltipContent>
                          </Tooltip>
                          
                          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                          
                           <Tooltip>
                             <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
                                <Expand className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p></TooltipContent>
                          </Tooltip>
                           
                           <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                           <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => api?.scrollNext()} disabled={!api?.canScrollNext()}>
                                  <ChevronRight className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Next Page</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <p className="text-sm font-sans font-medium text-muted-foreground w-20 md:w-24 text-center">
                            {current} / {count}
                        </p>
                    </div>
                  </Carousel>
            )}
        </Document>
      </div>
    </div>
  );
}
