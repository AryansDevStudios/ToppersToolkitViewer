
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Anjali Singh",
    achievement: "Class 10 Topper",
    quote: "Topper's Toolkit was a game-changer for my board exams. The notes are concise, easy to understand, and cover all the important topics. I couldn't have done it without these resources!",
    imgSrc: "https://picsum.photos/seed/topper1/100/100",
  },
  {
    name: "Rohan Verma",
    achievement: "Scored 98% in Science",
    quote: "The mind maps and MCQs on this platform are fantastic for revision. They helped me visualize complex concepts and test my knowledge effectively.",
    imgSrc: "https://picsum.photos/seed/topper2/100/100",
  },
  {
    name: "Priya Sharma",
    achievement: "JEE Main Qualifier",
    quote: "The detailed notes for Physics and Chemistry were incredibly helpful for my competitive exam preparation. A must-have for any serious student.",
    imgSrc: "https://picsum.photos/seed/topper3/100/100",
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

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="flex flex-col items-center text-center p-6 flex-1">
                       <Image
                        src={testimonial.imgSrc}
                        alt={`Photo of ${testimonial.name}`}
                        width={80}
                        height={80}
                        className="rounded-full mb-4 border-4 border-primary/20"
                        data-ai-hint="student portrait"
                      />
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm font-semibold text-primary mb-3">{testimonial.achievement}</p>
                      <blockquote className="text-muted-foreground text-sm flex-1">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
          <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
