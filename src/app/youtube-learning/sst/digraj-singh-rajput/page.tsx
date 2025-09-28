
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Globe, Landmark, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    'history-ch1': { title: '1. French Revolution', description: "An introduction to French society, the estates system under Louis XVI, and the subsequent events leading to the revolution and the rise of Napoleon Bonaparte.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FN4KswB4OA0c%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DN4KswB4OA0c&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video" }, { src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FFxrY5xs7GjQ%3Fstart%3D64&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DFxrY5xs7GjQ&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video" }] },
    'history-ch2': { title: '2. Socialism in Europe and the Russian Revolution', description: "This chapter talks about the advent of socialism in Europe and the subsequent Russian Revolution.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F-VtOiHjmftc%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D-VtOiHjmftc&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video" }, { src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FS0RMUb1DSyU%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DS0RMUb1DSyU&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video" }] },
    'history-ch3': { title: '3. Nazism and the Rise of Hitler', description: "A description of the story from World War I to World War II, starting with the Weimar Republic and ending with the Holocaust.", videos: [{ src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FrFS0j494QEY&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DrFS0j494QEY&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video" }, { src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FAISKmBbGGjA%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DAISKmBbGGjA&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video" }] },
    'geo-ch1': { title: "4. India-Size And Location", description: "This chapter covers our country's geographical features, its size and location, and its neighbors.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FCdVf_H44tho%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DCdVf_H44tho&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F-mBIBH5TAzE%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D-mBIBH5TAzE&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'geo-ch2': { title: "5. Physical Features of India", description: "Discusses India's major physiographic divisions from the Himalayan mountains to the islands.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FHpfNT8KhkoQ%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DHpfNT8KhkoQ&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fj4LdeQDEYlE%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dj4LdeQDEYlE&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'geo-ch3': { title: "6. Drainage", description: "Explains the two major river systems of India—the Himalayan and Peninsular rivers—and the land features they form.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F7-4UgkKHm-g%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D7-4UgkKHm-g&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FemXN-cnwRwM%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DemXN-cnwRwM&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'geo-ch4': { title: "7. Climate", description: "Discusses the factors affecting India's climate, such as latitude, altitude, and winds, and explains the various seasons.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FJfT_ci-pi-k%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DJfT_ci-pi-k&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F31FdXFkiHgQ%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D31FdXFkiHgQ&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'geo-ch5': { title: "8. Population", description: "Introduces data from the 2011 Census and highlights population distribution and density across states.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FL26wKCUwo5o%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DL26wKCUwo5o&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FCGY5NJou4D0%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DCGY5NJou4D0&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'pol-ch1': { title: "9. What is Democracy? Why Democracy?", description: "Defines democracy and explains why it is a preferred form of government.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FzEXL6vwgz6c%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DzEXL6vwgz6c&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fk_OoOzQSmQI%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dk_OoOzQSmQI&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'pol-ch2': { title: "10. Constitutional Design", description: "Explains why a constitution is important and discusses the making of the Indian Constitution.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FHp03gNFqHrw%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DHp03gNFqHrw&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FgIYwH2o4-HI&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DgIYwH2o4-HI&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'pol-ch3': { title: "11. Electoral Politics", description: "Explains the need for elections, constituencies, nominations, campaigns, polling, and counting of votes.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F09c12iKuLfY%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D09c12iKuLfY&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fpy9OGrgUVXo%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dpy9OGrgUVXo&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'pol-ch4': { title: "12. Working of Institutions", description: "Explains how policy decisions are made and discusses the role of Parliament, including Rajya Sabha and Lok Sabha.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FoMqEsD-Utac%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DoMqEsD-Utac&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FOlEiVCZO7dE%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DOlEiVCZO7dE&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'pol-ch5': { title: "13. Democratic Rights", description: "Gives an overview of life without rights and explains the six fundamental rights in the Indian constitution.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FgjIlCuiryfs%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DgjIlCuiryfs&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F4dQeTdqHAeg%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D4dQeTdqHAeg&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'eco-ch1': { title: "14. People as a Resource", description: "Provides an overview of how people act as resources, economic activities, quality of population, and employment.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FOpfMnc92gDI%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DOpfMnc92gDI&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FzYp2SEVeY7M%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DzYp2SEVeY7M&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'eco-ch2': { title: "15. Poverty as a Challenge", description: "Talks about rural and urban poverty, social exclusion, and vulnerability, along with causes and measures.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FDaE_Hpe-sEI%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DDaE_Hpe-sEI&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fr5MQ4DzoINM%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dr5MQ4DzoINM&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
    'eco-ch3': { title: "16. Food Security in India", description: "Explores food security and the various factors revolving around it, explained through story examples.", videos: [{src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F2oCsMusryJo%3Flist%3DPLKrMFg1EPRmGZ48Ko9xVUQ6Bs4Wgfgiav&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D2oCsMusryJo&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "New One Shot Video"}, {src: "https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FJpKo_WNRtfQ%3Flist%3DPLKrMFg1EPRmGZmO3Fb44uEupYKdxyhlFU&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DJpKo_WNRtfQ&key=96f1f04c5f4143bcb0f2e68c87d65feb", caption: "Rapid Revision Video"}] },
};

const Sidebar = () => (
    <aside className="w-full lg:w-72 lg:h-screen lg:fixed top-0 left-0 bg-card border-r p-6 box-border lg:flex flex-col hidden">
        <div className="text-xl font-bold text-primary mb-5 pb-4 border-b">
            Class 9 SST
        </div>
        <ScrollArea className="flex-1">
            <nav>
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
    </aside>
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
        <div className="flex flex-col lg:flex-row bg-background">
             <Button asChild variant="outline" size="sm" className="absolute top-4 left-4 z-10 lg:hidden">
                <Link href="/youtube-learning/sst">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </Button>
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-4 md:p-10 space-y-8">
                 <Button asChild variant="outline" size="sm" className="mb-4 hidden lg:inline-flex">
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
