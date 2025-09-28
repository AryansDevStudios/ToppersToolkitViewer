
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
];

const videoContent = {
    'ch1': { title: '1. Number Systems', description: "Explore the world of numbers, from integers to rational and irrational numbers, and learn how to represent them on the number line.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FIMnSIaPcqiE%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DIMnSIaPcqiE&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FIMnSIaPcqiE%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch2': { title: '2. Polynomials', description: "Dive into the basics of algebraic expressions, understanding degrees, coefficients, and the different types of polynomials.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F4VHrvMutJQw%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D4VHrvMutJQw&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2F4VHrvMutJQw%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch3': { title: '3. Coordinate Geometry', description: "Learn how to plot points on the Cartesian plane and understand the relationship between algebra and geometry.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F3MIZUl6bWxY%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D3MIZUl6bWxY&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2F3MIZUl6bWxY%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch4': { title: '4. Linear Equations in Two Variables', description: "Understand how to represent and solve linear equations with two variables, and see their graphical representation.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FrnudiJxVXxM%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DrnudiJxVXxM&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FrnudiJxVXxM%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch5': { title: '5. Introduction to Euclid\'s Geometry', description: "Journey back in time to explore the foundational axioms and postulates of geometry as laid down by Euclid.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FmxeXcTjQiuM%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DmxeXcTjQiuM&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FmxeXcTjQiuM%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch6': { title: '6. Lines and Angles', description: "Master the properties of lines and angles, including parallel lines, transversals, and angle relationships.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FnEYldznpZmk%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DnEYldznpZmk&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FnEYldznpZmk%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch7': { title: '7. Triangles', description: "Discover the properties of triangles, congruence rules, and inequalities in this fundamental chapter of geometry.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FwIeiqvdVCJI%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DwIeiqvdVCJI&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FwIeiqvdVCJI%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch8': { title: '8. Quadrilaterals', description: "Explore the different types of quadrilaterals and their unique properties, from parallelograms to trapezoids.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FSTrfPXdTzUA%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DSTrfPXdTzUA&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FSTrfPXdTzUA%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch9': { title: '9. Circles', description: "Learn about the various parts of a circle, their properties, and theorems related to chords, arcs, and angles.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FmCWjZ5q58u8%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DmCWjZ5q58u8&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FmCWjZ5q58u8%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
    'ch10': { title: '10. Heron\'s Formula', description: "Discover a powerful formula to find the area of a triangle when the lengths of all three sides are known.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FxovtUr4TN6Y%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DxovtUr4TN6Y&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FxovtUr4TN6Y%2Fhqdefault.jpg&key=YOUR_API_KEY&type=text%2Fhtml&schema=youtube", caption: "One Shot Lecture" }] },
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
    



    