"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, BookCopy, UserPlus } from "lucide-react";
import Image from "next/image";
import { iconMap } from "@/lib/iconMap";
import type { LucideIcon } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  about: string[];
};

const features: { title: string; icon: keyof typeof iconMap; description: string }[] = [
  { title: "Leaderboard", icon: "Swords", description: "Compete with peers and track your progress. Stay motivated by climbing ranks as you solve quizzes, puzzles, and practice tests." },
  { title: "Puzzle & Quiz", icon: "Puzzle", description: "Sharpen your mind with interactive puzzles and quizzes. A fun way to learn, test knowledge, and boost problem-solving skills." },
  { title: "Notices", icon: "ClipboardList", description: "Stay updated with important announcements, events, and academic reminders — all in one place." },
  { title: "AI Help", icon: "Bot", description: "Get instant answers and explanations powered by AI. Perfect for quick clarifications and 24/7 study support." },
  { title: "Doubt Box", icon: "MessageSquare", description: "Ask your questions directly and get reliable answers from admins or mentors. A safe space to clear academic doubts." },
  { title: "About Us", icon: "Users", description: "Learn about our mission to simplify learning and provide quality study materials for every student." },
  { title: "Telegram Chat", icon: "Send", description: "Join the student community on Telegram. Discuss topics, share knowledge, and stay connected with peers." },
  { title: "GS MCQs", icon: "BookCheck", description: "Practice multiple-choice questions across subjects. Build accuracy and confidence for exams with instant feedback." },
  { title: "Mindmaps", icon: "BrainCircuit", description: "Visualize topics with better retention. A powerful tool to organize and revise complex concepts easily." },
];

const contributors: { name: string; subject: string; icon: keyof typeof iconMap }[] = [
  { name: "Kuldeep Singh", subject: "SST", icon: "Landmark" },
  { name: "Aryan Gupta", subject: "Science", icon: "FlaskConical" },
  { name: "Deepraj Pandey", subject: "Maths", icon: "Calculator" },
];

// ✅ Core Team (Developers/Owner/Manager)
const team: TeamMember[] = [
  {
    id: "kuldeep-singh",
    name: "Kuldeep Singh",
    role: "Owner",
    photoUrl: "/images/KuldeepsImage.png",
    about: [
      "Founder and visionary behind Topper's Toolkit.",
      "Leads platform strategy, growth, and key decisions.",
    ],
  },
  {
    id: "aryan-gupta",
    name: "Aryan Gupta",
    role: "Developer",
    photoUrl: "/images/AryansImage.png",
    about: [
      "Full-stack developer responsible for building the platform.",
      "Focuses on seamless user experience and cutting-edge features.",
    ],
  },
  {
    id: "ishan-jaiswal",
    name: "Ishan Jaiswal",
    role: "Manager",
    photoUrl: "/images/IshansImage.png",
    about: [
      "Handles operations and community management.",
      "Ensures smooth collaboration across all projects.",
    ],
  },
];

const FeatureItem = ({ title, icon: Icon, description }: { title: string; icon: LucideIcon; description: string }) => (
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
        Topper's Toolkit provides high-quality study materials in a secure, user-friendly environment. Here's what you can do:
      </p>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {features.map((f) => {
          const Icon = iconMap[f.icon] || BookCopy;
          return <FeatureItem key={f.title} title={f.title} icon={Icon} description={f.description} />;
        })}
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
        Our mission is to revolutionize education by blending curated content with cutting-edge technology,
        empowering students to study smarter and achieve academic excellence.
      </p>
    </CardContent>
  </Card>
);

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
        {contributors.map((c) => {
          const Icon = iconMap[c.icon] || Users;
          return (
            <div key={c.name} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-semibold">{c.name}</h4>
                <p className="text-sm text-muted-foreground">{c.subject}</p>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const TeamCard = ({ member }: { member: TeamMember }) => (
  <Card className="overflow-hidden flex flex-col">
    <div className="relative aspect-[4/3] w-full">
      <Image src={member.photoUrl} alt={`Photo of ${member.name}`} fill className="object-cover" />
    </div>
    <CardHeader>
      <CardTitle className="text-xl">{member.name}</CardTitle>
      <p className="text-md font-semibold text-primary">{member.role}</p>
    </CardHeader>
    <CardContent className="flex-1">
      {member.about.map((text, i) => (
        <p key={i} className="text-muted-foreground text-sm mb-3 last:mb-0">
          {text}
        </p>
      ))}
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
          The Team Behind Topper&apos;s Toolkit
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Meet the passionate minds building and managing the platform for students everywhere.
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
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
