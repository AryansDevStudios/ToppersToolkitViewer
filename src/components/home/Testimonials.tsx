
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Kuldeep Singh",
    achievement: "Owner & Founder",
    quote: "I'm delighted to see our high-quality notes helping so many students achieve their goals. It's what Topper's Toolkit is all about!",
    imgSrc: "https://picsum.photos/seed/kuldeep/100/100",
  },
  {
    name: "Aryan Gupta",
    achievement: "Developer",
    quote: "It's rewarding to build a platform that supports and delivers such valuable educational content to students everywhere.",
    imgSrc: "/images/AryansImage.webp",
  },
  {
    name: "Ishan Jaiswal",
    achievement: "Manager",
    quote: "Being part of the Topper's Toolkit team is inspiring. Even with my PW batch, I find these notes incredibly useful.",
    imgSrc: "https://picsum.photos/seed/ishan/100/100",
  },
  {
    name: "Gyan Singh",
    achievement: "School Topper in GS Olympiad",
    quote: "I really like the notes provided. They are clear, concise, and have helped me a lot in my studies.",
    imgSrc: "https://picsum.photos/seed/gyan/100/100",
  },
    {
    name: "Divyansh Pathak",
    achievement: "Student",
    quote: "I'm very satisfied with the quality of the material. It's well-organized and covers everything I need.",
    imgSrc: "https://picsum.photos/seed/divyansh/100/100",
  },
    {
    name: "Aditi Tripathi",
    achievement: "Student",
    quote: "These notes have been very useful to me. They make difficult topics much easier to understand.",
    imgSrc: "https://picsum.photos/seed/aditi/100/100",
  },
  {
    name: "Priya",
    achievement: "Student",
    quote: "I just love these notes! They are my go-to resource for exam preparation. Highly recommended!",
    imgSrc: "https://picsum.photos/seed/priya/100/100",
  },
];

export function Testimonials() {
  return (
    <section className="w-full py-12 md:py-16 bg-muted/40">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">What Our Toppers Say</h2>
          <p className="mt-2 text-muted-foreground">
            Success stories from students who have excelled with our toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
                <Card key={index} className="h-full flex flex-col">
                    <CardContent className="flex flex-col p-6 flex-1">
                      <div className="flex items-center mb-4">
                         <Image
                          src={testimonial.imgSrc}
                          alt={`Photo of ${testimonial.name}`}
                          width={48}
                          height={48}
                          className="rounded-full mr-4 border-2 border-primary/20"
                          data-ai-hint="student portrait"
                        />
                        <div>
                          <h3 className="font-bold text-base">{testimonial.name}</h3>
                          <p className="text-xs font-semibold text-primary">{testimonial.achievement}</p>
                        </div>
                      </div>
                      <blockquote className="text-muted-foreground text-sm flex-1">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
