

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Globe, Landmark, DollarSign, ArrowLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const subjects = [
    {
        name: 'History',
        icon: Book,
        chapters: [
            { id: 'history-ch1', title: '1. French Revolution' },
            { id: 'history-ch2', title: '2. Socialism in Europe' },
            { id: 'history-ch3', title: '3. Nazism & Rise of Hitler' },
        ]
    },
    {
        name: 'Geography',
        icon: Globe,
        chapters: [
            { id: 'geo-ch1', title: '4. India-Size And Location' },
            { id: 'geo-ch2', title: '5. Physical Features of India' },
            { id: 'geo-ch3', title: '6. Drainage' },
            { id: 'geo-ch4', title: '7. Climate' },
            { id: 'geo-ch5', title: '8. Population' },
        ]
    },
    {
        name: 'Political Science',
        icon: Landmark,
        chapters: [
            { id: 'pol-ch1', title: '9. What is Democracy?' },
            { id: 'pol-ch2', title: '10. Constitutional Design' },
            { id: 'pol-ch3', title: '11. Electoral Politics' },
            { id: 'pol-ch4', title: '12. Working of Institutions' },
            { id: 'pol-ch5', title: '13. Democratic Rights' },
        ]
    },
    {
        name: 'Economics',
        icon: DollarSign,
        chapters: [
            { id: 'eco-ch1', title: '14. People as a Resource' },
            { id: 'eco-ch2', title: '15. Poverty as a Challenge' },
            { id: 'eco-ch3', title: '16. Food Security in India' },
        ]
    }
];

const videoContent = {
    'history-ch1': { title: '1. French Revolution', description: "An introduction to French society, the estates system under Louis XVI, and the subsequent events leading to the revolution and the rise of Napoleon Bonaparte.", videos: [{ src: "https://www.youtube.com/embed/N4KswB4OA0c?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video" }, { src: "https://www.youtube.com/embed/FxrY5xs7GjQ?start=64", caption: "Rapid Revision Video" }] },
    'history-ch2': { title: '2. Socialism in Europe and the Russian Revolution', description: "This chapter talks about the advent of socialism in Europe and the subsequent Russian Revolution.", videos: [{ src: "https://www.youtube.com/embed/-VtOiHjmftc?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video" }, { src: "https://www.youtube.com/embed/S0RMUb1DSyU?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video" }] },
    'history-ch3': { title: '3. Nazism and the Rise of Hitler', description: "A description of the story from World War I to World War II, starting with the Weimar Republic and ending with the Holocaust.", videos: [{ src: "https://www.youtube.com/embed/rFS0j494QEY", caption: "New One Shot Video" }, { src: "https://www.youtube.com/embed/AISKmBbGGjA?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video" }] },
    'geo-ch1': { title: "4. India-Size And Location", description: "This chapter covers our country's geographical features, its size and location, and its neighbors.", videos: [{src: "https://www.youtube.com/embed/CdVf_H44tho?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/-mBIBH5TAzE?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'geo-ch2': { title: "5. Physical Features of India", description: "Discusses India's major physiographic divisions from the Himalayan mountains to the islands.", videos: [{src: "https://www.youtube.com/embed/HpfNT8KhkoQ?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/j4LdeQDEYlE?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'geo-ch3': { title: "6. Drainage", description: "Explains the two major river systems of India—the Himalayan and Peninsular rivers—and the land features they form.", videos: [{src: "https://www.youtube.com/embed/7-4UgkKHm-g?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/emXN-cnwRwM?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'geo-ch4': { title: "7. Climate", description: "Discusses the factors affecting India's climate, such as latitude, altitude, and winds, and explains the various seasons.", videos: [{src: "https://www.youtube.com/embed/JfT_ci-pi-k?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/31FdXFkiHgQ?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'geo-ch5': { title: "8. Population", description: "Introduces data from the 2011 Census and highlights population distribution and density across states.", videos: [{src: "https://www.youtube.com/embed/L26wKCUwo5o?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/CGY5NJou4D0?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'pol-ch1': { title: "9. What is Democracy? Why Democracy?", description: "Defines democracy and explains why it is a preferred form of government.", videos: [{src: "https://www.youtube.com/embed/zEXL6vwgz6c?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/k_OoOzQSmQI?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'pol-ch2': { title: "10. Constitutional Design", description: "Explains why a constitution is important and discusses the making of the Indian Constitution.", videos: [{src: "https://www.youtube.com/embed/Hp03gNFqHrw?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/gIYwH2o4-HI", caption: "Rapid Revision Video"}] },
    'pol-ch3': { title: "11. Electoral Politics", description: "Explains the need for elections, constituencies, nominations, campaigns, polling, and counting of votes.", videos: [{src: "https://www.youtube.com/embed/09c12iKuLfY?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/py9OGrgUVXo?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'pol-ch4': { title: "12. Working of Institutions", description: "Explains how policy decisions are made and discusses the role of Parliament, including Rajya Sabha and Lok Sabha.", videos: [{src: "https://www.youtube.com/embed/oMqEsD-Utac?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/OlEiVCZO7dE?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'pol-ch5': { title: "13. Democratic Rights", description: "Gives an overview of life without rights and explains the six fundamental rights in the Indian constitution.", videos: [{src: "https://www.youtube.com/embed/gjIlCuiryfs?feature=oembed", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/4dQeTdqHAeg?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'eco-ch1': { title: "14. People as a Resource", description: "Provides an overview of how people act as resources, economic activities, quality of population, and employment.", videos: [{src: "https://www.youtube.com/embed/OpfMnc92gDI?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/zYp2SEVeY7M?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'eco-ch2': { title: "15. Poverty as a Challenge", description: "Talks about rural and urban poverty, social exclusion, and vulnerability, along with causes and measures.", videos: [{src: "https://www.youtube.com/embed/DaE_Hpe-sEI?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/r5MQ4DzoINM?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
    'eco-ch3': { title: "16. Food Security in India", description: "Explores food security and the various factors revolving around it, explained through story examples.", videos: [{src: "https://www.youtube.com/embed/2oCsMusryJo?list=PLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav", caption: "New One Shot Video"}, {src: "https://www.youtube.com/embed/JpKo_WNRtfQ?list=PLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU", caption: "Rapid Revision Video"}] },
};

const SidebarMenu = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="default" size="icon" className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Chapter Menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
            <SheetHeader className="p-6 pb-2">
                <SheetTitle className="text-xl font-bold text-primary">Class 9 SST Chapters</SheetTitle>
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
                                            <a href={`#${chapter.id}`} className="block text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md p-2 transition-colors text-sm">
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
);


const VideoCard = ({ chapterId }: { chapterId: keyof typeof videoContent }) => {
    const chapter = videoContent[chapterId];
    if (!chapter) return null;
    return (
        <Card id={chapterId} className="scroll-mt-20">
            <CardHeader>
                <CardTitle className="text-xl text-primary">{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">{chapter.description}</p>
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


export default function DigrajSinghRajputPage() {
    return (
        <div className="bg-background">
            <SidebarMenu />
            <main className="p-4 md:p-10 space-y-8 pb-20">
                 <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/youtube-learning/sst">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to SST Teachers
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-6 pb-2 border-b-2 border-primary">History: India and the Contemporary World</h2>
                    <div className="space-y-6">
                        {subjects.find(s => s.name === 'History')?.chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                    </div>
                </div>
                 <div>
                    <h2 className="text-3xl font-extrabold tracking-tight my-6 pb-2 border-b-2 border-primary">Geography: Contemporary India</h2>
                    <div className="space-y-6">
                        {subjects.find(s => s.name === 'Geography')?.chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                    </div>
                </div>
                 <div>
                    <h2 className="text-3xl font-extrabold tracking-tight my-6 pb-2 border-b-2 border-primary">Political Science: Democratic Politics</h2>
                    <div className="space-y-6">
                        {subjects.find(s => s.name === 'Political Science')?.chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                    </div>
                </div>
                 <div>
                    <h2 className="text-3xl font-extrabold tracking-tight my-6 pb-2 border-b-2 border-primary">Economics</h2>
                    <div className="space-y-6">
                        {subjects.find(s => s.name === 'Economics')?.chapters.map(c => <VideoCard key={c.id} chapterId={c.id as keyof typeof videoContent} />)}
                    </div>
                </div>
            </main>
        </div>
    );
}

