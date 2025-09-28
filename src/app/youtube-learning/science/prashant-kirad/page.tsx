
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Globe, Landmark, DollarSign, ArrowLeft, Menu, FlaskConical, Atom, Dna } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const subjects = [
    {
        name: 'Chemistry',
        icon: FlaskConical,
        chapters: [
            { id: 'chem-ch1', title: '1. Matter in Our Surroundings' },
            { id: 'chem-ch2', title: '2. Is Matter Around Us Pure?' },
            { id: 'chem-ch3', title: '3. Atoms and Molecules' },
            { id: 'chem-ch4', title: '4. Structure of the Atom' },
        ]
    },
    {
        name: 'Biology',
        icon: Dna,
        chapters: [
            { id: 'bio-ch5', title: '5. The Fundamental Unit of Life - Cell' },
            { id: 'bio-ch6', title: '6. Tissues' },
            { id: 'bio-ch12', title: '12. Improvement in Food Resources' },
        ]
    },
    {
        name: 'Physics',
        icon: Atom,
        chapters: [
            { id: 'phy-ch7', title: '7. Motion' },
            { id: 'phy-ch8', title: '8. Force and Laws of Motion' },
            { id: 'phy-ch9', title: '9. Gravitation' },
            { id: 'phy-ch10', title: '10. Work and Energy' },
            { id: 'phy-ch11', title: '11. Sound' },
        ]
    }
];

const videoContent = {
    'chem-ch1': { title: '1. Matter in Our Surroundings', videos: [{ src: "https://www.youtube.com/embed/bmzDsWMSCTk", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/kceQg4X7j2E", caption: "Rapid Revision" }] },
    'chem-ch2': { title: '2. Is Matter Around Us Pure?', videos: [{ src: "https://www.youtube.com/embed/fDTLrhcIWx0", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/tjl1gtYhYsI", caption: "Rapid Revision" }] },
    'chem-ch3': { title: '3. Atoms and Molecules', videos: [{ src: "https://www.youtube.com/embed/Jy2bLuZU8ps", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/gE7nxVX2xn4", caption: "Rapid Revision" }] },
    'chem-ch4': { title: '4. Structure of the Atom', videos: [{ src: "https://www.youtube.com/embed/0UqHoagKXts", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/jja8iusxqKU", caption: "Rapid Revision" }] },
    'bio-ch5': { title: '5. The Fundamental Unit of Life - Cell', videos: [{ src: "https://www.youtube.com/embed/3YuuphvXYmo", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/LTaq4yHNtSk", caption: "Rapid Revision" }] },
    'bio-ch6': { title: '6. Tissues', videos: [{ src: "https://www.youtube.com/embed/RJsLw5cmbP8", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/VpRj5bPZqA", caption: "Rapid Revision" }] },
    'phy-ch7': { title: '7. Motion', videos: [{ src: "https://www.youtube.com/embed/jC6MW9KOQvU", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/MKycFW1uAzU", caption: "Rapid Revision" }] },
    'phy-ch8': { title: '8. Force and Laws of Motion', videos: [{ src: "https://www.youtube.com/embed/CfxfW64P04s", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/lKt93tG0eik", caption: "Rapid Revision" }] },
    'phy-ch9': { title: '9. Gravitation', videos: [{ src: "https://www.youtube.com/embed/yeFQ2Ce_nKo", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/8-rsy2zSj28", caption: "Rapid Revision" }] },
    'phy-ch10': { title: '10. Work and Energy', videos: [{ src: "https://www.youtube.com/embed/bGFE2Z-VVM8", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/j_kavOBi2aI", caption: "Rapid Revision" }] },
    'phy-ch11': { title: '11. Sound', videos: [{ src: "https://www.youtube.com/embed/UpXKKEbCByA", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/wL3y41Tsoc4", caption: "Rapid Revision" }] },
    'bio-ch12': { title: '12. Improvement in Food Resources', videos: [{ src: "https://www.youtube.com/embed/py7rvl_znRs", caption: "One Shot Lecture" }, { src: "https://www.youtube.com/embed/gE7nxVX2xn4", caption: "Rapid Revision" }] },
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
                    <SheetTitle className="text-xl font-bold text-primary">Class 9 Science Chapters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                    <nav className="p-6">
                        <ul>
                            {subjects.map(subject => (
                                <li key={subject.name} className="mb-4">
                                    <div className="font-semibold text-lg flex items-center mb-2">
                                        <subject.icon className="mr-3 h-5 w-5" />
                                        {subject.name}
                                    </div>
                                    <ul className="space-y-1">
                                        {subject.chapters.map(chapter => (
                                            <li key={chapter.id}>
                                                <a href={`#${chapter.id}`} onClick={() => setIsOpen(false)} className="block text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md p-2 transition-colors text-sm">
                                                    {chapter.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {chapter.videos.map((video, index) => (
                        <div key={index}>
                            <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                                <iframe src={video.src} title={video.caption} allowFullScreen className="w-full h-full"></iframe>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2">{video.caption}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export default function PrashantKiradSciencePage() {
    return (
        <div className="bg-background">
            <SidebarMenu />
            <main className="p-4 md:p-10 space-y-8 pb-20">
                 <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/youtube-learning/science">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Science Teachers
                    </Link>
                </Button>
                
                {subjects.map(subject => (
                     <div key={subject.name}>
                        <h2 className="text-3xl font-extrabold tracking-tight my-6 pb-2 border-b-2 border-primary">{subject.name}</h2>
                        <div className="space-y-6">
                            {subject.chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
