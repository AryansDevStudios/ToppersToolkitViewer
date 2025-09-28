
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    'ch1': { title: '1. Number Systems', description: "Explore the world of numbers, from integers to rational and irrational numbers, and learn how to represent them on the number line.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=SNd3mGg9f3M88p7Y&amp;list=PL4AiseKN0xx8hBVR06p2E3722q709Pz_k", caption: "One Shot Lecture" }] },
    'ch2': { title: '2. Polynomials', description: "Dive into the basics of algebraic expressions, understanding degrees, coefficients, and the different types of polynomials.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=G0Kx2qjB0E8lXn5T&amp;list=PL4AiseKN0xx9PTbMI32Yx6Lw3HlSnMhD7", caption: "One Shot Lecture" }] },
    'ch3': { title: '3. Coordinate Geometry', description: "Learn how to plot points on the Cartesian plane and understand the relationship between algebra and geometry.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=Gv27z2Lw-m-5D4k8&amp;list=PL4AiseKN0xx9KqK0j2b22Y0-BvA-5x1TT", caption: "One Shot Lecture" }] },
    'ch4': { title: '4. Linear Equations in Two Variables', description: "Understand how to represent and solve linear equations with two variables, and see their graphical representation.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=265fQf5fT2W1iYhS&amp;list=PL4AiseKN0xx8Dks4n9vJb-eY3a15L5tB9", caption: "One Shot Lecture" }] },
    'ch5': { title: '5. Introduction to Euclid\'s Geometry', description: "Journey back in time to explore the foundational axioms and postulates of geometry as laid down by Euclid.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=_kG4x8K4d9kC7Q5L&amp;list=PL4AiseKN0xx9xNkPZ_A0YyYyYYoGqgA49", caption: "One Shot Lecture" }] },
    'ch6': { title: '6. Lines and Angles', description: "Master the properties of lines and angles, including parallel lines, transversals, and angle relationships.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=G0Kx2qjB0E8lXn5T&amp;list=PL4AiseKN0xx9PTbMI32Yx6Lw3HlSnMhD7", caption: "One Shot Lecture" }] },
    'ch7': { title: '7. Triangles', description: "Discover the properties of triangles, congruence rules, and inequalities in this fundamental chapter of geometry.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=7J3lK8B3S9n0mG3f&amp;list=PL4AiseKN0xx9hN-D9pA3jV3p3b4cMkmj5", caption: "One Shot Lecture" }] },
    'ch8': { title: '8. Quadrilaterals', description: "Explore the different types of quadrilaterals and their unique properties, from parallelograms to trapezoids.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=x9Y8F5F8e7d7S_rE&amp;list=PL4AiseKN0xx89fXpC4Xy4e4Rj2uP_4_pP", caption: "One Shot Lecture" }] },
    'ch9': { title: '9. Circles', description: "Learn about the various parts of a circle, their properties, and theorems related to chords, arcs, and angles.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=W8g9d9V9w9C4j_fD&amp;list=PL4AiseKN0xx_2qfGj-fadesT8mmQxL5Jv", caption: "One Shot Lecture" }] },
    'ch10': { title: '10. Heron\'s Formula', description: "Discover a powerful formula to find the area of a triangle when the lengths of all three sides are known.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=W-r8s8S7b4Z-k_jV&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6", caption: "One Shot Lecture" }] },
    'ch11': { title: '11. Surface Areas and Volumes', description: "Calculate the surface areas and volumes of various 3D shapes like cubes, cuboids, cylinders, cones, and spheres.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=B5e7S4Z-l_k_jV9W&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6", caption: "One Shot Lecture" }] },
    'ch12': { title: '12. Statistics', description: "Learn how to collect, present, and analyze data using various graphical representations and measures of central tendency.", videos: [{ src: "https://www.youtube.com/embed/videoseries?si=A-s8s8S7b4Z-k_jV&amp;list=PL4AiseKN0xx-f2v3S0W-Iu_S-wA6rTfG6", caption: "One Shot Lecture" }] },
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
                {chapter.description && <p className="text-muted-foreground mb-6">{chapter.description}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {chapter.videos.map((video, index) => (
                        <div key={index}>
                            <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                                <iframe src={video.src} title={video.caption} allowFullScreen className="w-full h-full"></iframe>
                            </div>
                            {video.caption && <p className="text-center text-sm text-muted-foreground mt-2">{video.caption}</p>}
                        </div>
                    ))}
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
    