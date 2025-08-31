
// A dedicated file to store teacher profile data.
// This makes it easy to manage teacher information without changing the page code.

export interface TeacherProfile {
  id: string;
  name: string;
  subject: string;
  photoUrl: string;
  quote: string;
  about: string[];
}

export const teachers: TeacherProfile[] = [
  {
    id: "kuldeep-singh",
    name: "Kuldeep Singh",
    subject: "Science & Mathematics",
    photoUrl: "https://picsum.photos/400/400",
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    about: [
      "With over a decade of experience, Kuldeep Singh is passionate about making complex scientific and mathematical concepts accessible and exciting for all students.",
      "He believes in a hands-on approach to learning, encouraging students to experiment and ask questions. His goal is to foster a lifelong love for inquiry and discovery."
    ],
  },
  {
    id: "aryan-gupta",
    name: "Aryan Gupta",
    subject: "Technology & Development",
    photoUrl: "https://picsum.photos/400/400",
    quote: "Technology is best when it brings people together.",
    about: [
      "As the developer behind Topper's Toolkit, Aryan Gupta focuses on creating digital tools that enhance the learning experience.",
      "He is dedicated to bridging the gap between education and technology, building platforms that are both powerful and easy to use for students and educators alike."
    ],
  },
  // You can add more teacher profiles here
];
