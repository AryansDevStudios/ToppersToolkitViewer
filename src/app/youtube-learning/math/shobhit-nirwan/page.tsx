
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma, ArrowLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const chapters = [
    { id: 'ch1', title: '1. Number Systems' },
    { id: 'ch2', title: '2. Polynomials' },
    { id: 'ch3', title: '3. Coordinate Geometry' },
    { id: 'ch4', title: '4. Linear Equations in Two Variables' },
    { id: 'ch5', title: '5. Introduction to Euclid\'s Geometry' },
    { id: 'ch6', title: '6. Lines and Angles' },
    { id: 'ch7', title: '7. Triangles' },
    { id: 'ch8', title: '8. Quadrilaterals' },
    { id: 'ch9', title: '9. Circles' },
    { id: 'ch10', title: '10. Heron\'s Formula' },
    { id: 'ch11', title: '11. Surface Areas and Volumes' },
    { id: 'ch12', title: '12. Statistics' },
];

const videoContent = {
    'ch1': { title: '1. Number Systems', videoSrc: "https://www.youtube.com/embed/videoseries?si=SNd3mGg9f3M88p7Y&amp;list=PL4AiseKN0xx8hBVR06p2E3722q709Pz_k" },
    'ch2': { title: '2. Polynomials', videoSrc: "https://www.youtube.com/embed/videoseries?si=G0Kx2qjB0E8lXn5T&amp;list=PL4AiseKN0xx9PTbMI32Yx6Lw3HlSnMhD7" },
    'ch3': { title: '3. Coordinate Geometry', videoSrc: "https://www.youtube.com/embed/videoseries?si=Gv27z2Lw-m-5D4k8&amp;list=PL4AiseKN0xx9KqK0j2b22Y0-BvA-5x1TT" },
    'ch4': { title: '4. Linear Equations in Two Variables', videoSrc: "https://www.youtube.com/embed/videoseries?si=265fQf5fT2W1iYhS&amp;list=PL4AiseKN0xx8Dks4n9vJb-eY3a15L5tB9" },
    'ch5': { title: '5. Introduction to Euclid\'s Geometry', videoSrc: "https://www.youtube.com/embed/videoseries?si=_kG4x8K4d9kC7Q5L&amp;list=PL4AiseKN0xx9xNkPZ_A0YyYyYYoGqgA49" },
    'ch6': { title: '6. Lines and Angles', videoSrc: "https://www.youtube.com/embed/videoseries?si=G0Kx2qjB0E8lXn5T&amp;list=PL4AiseKN0xx9PTbMI32Yx6Lw3HlSnMhD7" },
    'ch7': { title: '7. Triangles', videoSrc: "https://www.youtube.com/embed/videoseries?si=7J3lK8B3S9n0mG3f&amp;list=PL4AiseKN0xx9hN-D9pA3jV3p3b4cMkmj5" },
    'ch8': { title: '8. Quadrilaterals', videoSrc: "https://www.youtube.com/embed/videoseries?si=x9Y8F5F8e7d7S_rE&amp;list=PL4AiseKN0xx89fXpC4Xy4e4Rj2uP_4_pP" },
    'ch9': { title: '9. Circles', videoSrc: "https://www.youtube.com/embed/videoseries?si=W8g9d9V9w9C4j_fD&amp;list=PL4AiseKN0xx_2qfGj-fadesT8mmQxL5Jv" },
    'ch10': { title: '10. Heron\'s Formula', videoSrc: "https://www.youtube.com/embed/videoseries?si=W-r8s8S7b4Z-k_jV&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6" },
    'ch11': { title: '11. Surface Areas and Volumes', videoSrc: "https://www.youtube.com/embed/videoseries?si=B5e7S4Z-l_k_jV9W&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6" },
    'ch12': { title: '12. Statistics', videoSrc: "https://www.youtube.com/embed/videoseries?si=A-s8s8S7b4Z-k_jV&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6" },
};

const SidebarMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="default" size="icon" className="fixed bottom-20 lg:bottom-8 left-4 z-50 h-12 w-12 rounded-full shadow-lg">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Chapter Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-xl font-bold text-primary">Class 9 Math Chapters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                    <nav className="p-6">
                        <ul>
                           {chapters.map(chapter => (
                                <li key={chapter.id}>
                                    <a href={`#${chapter.id}`} onClick={() => setIsOpen(false)} className="block text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md p-2 transition-colors text-sm">
                                        {chapter.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
};


const VideoCard = ({ chapterId }: { chapterId: keyof typeof videoContent }) => {
    const chapter = videoContent[chapterId];
    if (!chapter) return null;
    return (
        <Card id={chapterId} className="scroll-mt-20">
            <CardHeader>
                <CardTitle className="text-xl text-primary">{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                    <iframe src={chapter.videoSrc} title={chapter.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe>
                </div>
            </CardContent>
        </Card>
    );
};


export default function ShobhitNirwanMathPage() {
    return (
        <div className="bg-background">
            <SidebarMenu />
            <main className="p-4 md:p-10 space-y-8 pb-20">
                 <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/youtube-learning/math">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Math Teachers
                    </Link>
                </Button>
                
                <h2 className="text-3xl font-extrabold tracking-tight my-6 pb-2 border-b-2 border-primary">Class 9 Math Full Course</h2>
                <div className="space-y-6">
                    {chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                </div>
            </main>
        </div>
    );
}

