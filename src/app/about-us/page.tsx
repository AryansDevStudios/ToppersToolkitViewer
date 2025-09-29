
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Code, BookCopy, UserPlus, User, Shield } from 'lucide-react';
import Image from 'next/image';
import { iconMap } from '@/lib/iconMap';
import type { LucideIcon } from 'lucide-react';

const features: { title: string; icon: keyof typeof iconMap, description: string }[] = [
    { title: 'Leaderboard', icon: 'Swords', description: 'Compete with peers and track your progress. Stay motivated by climbing ranks as you solve quizzes, puzzles, and practice tests.' },
    { title: 'Puzzle & Quiz', icon: 'Puzzle', description: 'Sharpen your mind with interactive puzzles and quizzes. A fun way to learn, test knowledge, and boost problem-solving skills.' },
    { title: 'Notices', icon: 'ClipboardList', description: 'Stay updated with important announcements, events, and academic reminders — all in one place.' },
    { title: 'AI Help', icon: 'Bot', description: 'Get instant answers and explanations powered by AI. Perfect for quick clarifications and 24/7 study support.' },
    { title: 'Doubt Box', icon: 'MessageSquare', description: 'Ask your questions directly and get reliable answers from admins or mentors. A safe space to clear academic doubts.' },
    { title: 'About Us', icon: 'Users', description: 'Learn about our mission to simplify learning and provide quality study materials for every student.' },
    { title: 'Telegram Chat', icon: 'Send', description: 'Join the student community on Telegram. Discuss topics, share knowledge, and stay connected with peers.' },
    { title: 'GS MCQs', icon: 'BookCheck', description: 'Practice multiple-choice questions across subjects. Build accuracy and confidence for exams with instant feedback.' },
    { title: 'Mindmaps', icon: 'BrainCircuit', description: 'Visualize topics with better retention. A powerful tool to organize and revise complex concepts easily.' },
];

const FeatureItem = ({ title, icon: Icon, description }: { title: string, icon: LucideIcon, description:string }) => (
    <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary rounded-lg p-3">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const PlatformCard = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <BookCopy className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">About Our Platform</CardTitle>
            </div>
             <p className="text-muted-foreground pt-2">
                Topper's Toolkit is a dedicated platform designed to provide students with high-quality study materials in a secure and user-friendly environment. Our purpose is to help you access the resources you need to excel in your studies, all in one place. Here's what you can do:
            </p>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {features.map(feature => {
                    const Icon = iconMap[feature.icon] || BookCopy;
                    return (
                        <FeatureItem key={feature.title} title={feature.title} icon={Icon} description={feature.description} />
                    )
                })}
            </div>
        </CardContent>
    </Card>
);

const teamMembers = [
  { 
    name: "Kuldeep Singh", 
    role: "Owner & Founder", 
    imgSrc: "/images/KuldeepsImage.png?v=2", 
    description: "The visionary behind Topper's Toolkit, Kuldeep ensures that all content is of the highest quality and directly meets the needs of students.",
    "data-ai-hint": "male student portrait"
  },
  { 
    name: "Aryan Gupta", 
    role: "Developer", 
    imgSrc: "/images/AryansImage.png", 
    description: "The architect of the platform, Aryan brings the vision to life with his expertise in web development and passion for creating user-friendly experiences.",
    "data-ai-hint": "male student glasses"
  },
  { 
    name: "Ishan Jaiswal", 
    role: "Manager", 
    imgSrc: "/images/IshansImage.png", 
    description: "Ishan manages the project's operations, ensuring a smooth experience for all users and coordinating between the team and the student community.",
    "data-ai-hint": "male student happy"
  },
];

const TeamCard = () => (
    <Card>
        <CardHeader>
             <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Our Team</CardTitle>
            </div>
            <p className="text-muted-foreground pt-2">
                The core team behind the Topper's Toolkit project.
            </p>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                    <Card key={member.name} className="overflow-hidden text-center">
                        <CardContent className="p-6">
                             <Image
                                src={member.imgSrc}
                                alt={`Photo of ${member.name}`}
                                width={120}
                                height={120}
                                className="rounded-full mx-auto mb-4 border-4 border-primary/20"
                                data-ai-hint={member['data-ai-hint']}
                            />
                            <h4 className="font-bold text-xl">{member.name}</h4>
                            <p className="text-sm font-semibold text-primary mb-2">{member.role}</p>
                            <p className="text-sm text-muted-foreground">
                                {member.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
);


const MissionCard = () => (
    <Card className="bg-primary/5 border-primary/20 shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Lightbulb className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-lg text-foreground">
                Our goal is to revolutionize education by blending high-quality, curated content with cutting-edge technology. We aim to empower students with the tools they need to study smarter, overcome challenges, and achieve academic excellence.
            </p>
        </CardContent>
    </Card>
);

const contributors: { name: string, subject: string, icon: keyof typeof iconMap }[] = [
    { name: 'Kuldeep Singh', subject: 'SST', icon: 'Landmark' },
    { name: 'Aryan Gupta', subject: 'Science', icon: 'FlaskConical' },
    { name: 'Deepraj Pandey', subject: 'Maths', icon: 'Calculator' },
];

const StudentContributorsCard = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <UserPlus className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Student Contributors</CardTitle>
            </div>
            <p className="text-muted-foreground pt-2">
                We are grateful to these students for contributing their hard work and sharing their notes with the community.
            </p>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {contributors.map(contributor => {
                    const Icon = iconMap[contributor.icon] || Users;
                    return (
                        <div key={contributor.name} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                            <Icon className="h-6 w-6 text-primary" />
                            <div>
                                <h4 className="font-semibold">{contributor.name}</h4>
                                <p className="text-sm text-muted-foreground">{contributor.subject}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </CardContent>
    </Card>
);


export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Users className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          About Topper's Toolkit
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Meet the team, understand our mission, and see what makes our platform special.
        </p>
      </header>
      
      <main className="space-y-16">
        <section>
            <PlatformCard />
        </section>

        <section>
            <MissionCard />
        </section>
        
        <section>
            <StudentContributorsCard />
        </section>

        <section>
            <TeamCard />
        </section>
      </main>
    </div>
  );
}
