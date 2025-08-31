
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
    id: "roy-chan-antony",
    name: "Roy Chan Antony",
    subject: "Principal",
    photoUrl: "/teachers_photo/principal.jpg",
    quote: "Focus on your studies to build a better future. This school is your temple, and your teachers are your guides.",
    about: [
      "As the Principal, Roy Chan Antony stands as a role model for the entire school community. He masterfully manages all school activities and programs, inspiring both students and staff with his dedication and vision.",
      "In his interactions, he is known for his motivating presence in morning assemblies and his friendly demeanor with everyone. While approachable and supportive, he maintains firm discipline, ensuring the school environment remains respectful and conducive to learning.",
      "He consistently encourages students to focus on their academic journey, reminding them that their hard work today is the cornerstone of a successful future."
    ],
  },
  {
    id: "smitha-roy",
    name: "Smitha Roy",
    subject: "Incharge & SST Teacher",
    photoUrl: "/teachers_photo/smita.jpg",
    quote: "Understanding our society and history shapes who we become.",
    about: [
      "Smitha Roy masterfully balances her dual responsibilities as the school's Incharge and the dedicated Social Studies (SST) teacher for Class 9. Her passion for the subject shines through as she teaches History, Geography, Civics, and Economics, connecting students with the world around them.",
      "In the classroom, she maintains a well-managed and disciplined environment where students can focus deeply on their studies. Her unique teaching style commands respect and ensures that every student is diligent and completes their work on time.",
      "Despite her strict classroom presence, Mrs. Roy is known for being exceptionally polite, helpful, and sincere. She patiently clarifies doubts and serves as a true role model for both students and fellow educators."
    ],
  },
  {
    id: "amit-singh",
    name: "Amit Singh",
    subject: "Class Incharge (9-12)",
    photoUrl: "/teachers_photo/amit.jpg",
    quote: "Guidance and support are key to navigating the senior school years.",
    about: [
      "Amit Singh teaches sections A and B and serves as the dedicated incharge for the entire 9-12 class group.",
      "He is a cornerstone of support for senior students, guiding them through their academic journey."
    ],
  },
  {
    id: "divyam-sir",
    name: "Divyam Sir",
    subject: "Hybrid Class Coordinator & IT Teacher",
    photoUrl: "/teachers_photo/divyam.jpg",
    quote: "Technology in education opens up a new world of possibilities.",
    about: [
      "Divyam Sir skillfully manages the hybrid classes as the coordinator and teaches Information Technology.",
      "He is at the forefront of integrating modern technology into our school's learning environment."
    ],
  },
  {
    id: "shivkant-sir",
    name: "Shivkant Sir",
    subject: "History & Politics Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "To understand the present, we must learn from the past.",
    about: [
      "Shivkant Sir brings the stories of the past and the structures of the present to life for students in sections A and B.",
      "He teaches History and Politics with a passion that inspires curiosity and critical thinking."
    ],
  },
    {
    id: "chandra-prakash-shukla",
    name: "Chandra Prakash Shukla",
    subject: "Teacher (Section A)",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Every student has the potential to shine.",
    about: [
      "Chandra Prakash Shukla is a dedicated teacher for Section A, committed to fostering a positive learning environment.",
    ],
  },
  {
    id: "rajesh-sir",
    name: "Rajesh Sir",
    subject: "Teacher (Section B)",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Learning is a journey we take together.",
    about: [
      "Rajesh Sir is a core member of the teaching staff for Section B, helping students achieve their best.",
    ],
  },
  {
    id: "sunil-sir",
    name: "Sunil Sir",
    subject: "Teacher (H/C Section)",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Curiosity is the wick in the candle of learning.",
    about: [
      "Sunil Sir guides the students of the Hybrid/Commerce section with dedication and expertise.",
    ],
  },
  {
    id: "adalat-sir",
    name: "Adalat Sir",
    subject: "Hindi Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Language is the roadmap of a culture.",
    about: [
      "Adalat Sir fosters a deep appreciation for the Hindi language and its rich literary traditions.",
    ],
  },
  {
    id: "ashish-srivastava",
    name: "Ashish Srivastava",
    subject: "Mathematics Teacher",
    photoUrl: "/teachers_photo/ashish.jpg",
    quote: "Mathematics is not about numbers, but about understanding.",
    about: [
      "A very hardworking mathematics teacher and assistant class teacher, Ashish Srivastava is dedicated to helping students build strong problem-solving skills.",
    ],
  },
  {
    id: "divakar-pandey",
    name: "Divakar Pandey",
    subject: "Physics Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Physics is the universe's poetry.",
    about: [
      "Divakar Pandey makes the principles of physics engaging and understandable for all students.",
    ],
  },
  {
    id: "amersh-sir",
    name: "Amersh Sir",
    subject: "Chemistry Teacher & Class Teacher",
    photoUrl: "/teachers_photo/amresh.jpg",
    quote: "Chemistry is the science of change, and learning is the catalyst.",
    about: [
      "As both a chemistry teacher and a class teacher, Amersh Sir provides both academic and pastoral care to his students.",
    ],
  },
  {
    id: "ajay-sir",
    name: "Ajay Sir",
    subject: "Biology Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Biology gives you a brain, but life turns it into a mind.",
    about: [
      "Ajay Sir has a talent for making complex biological concepts from Class 11 incredibly smooth and understandable for his Class 9 students.",
      "He was also the first to register for our AI initiative, showing his forward-thinking approach to education."
    ],
  },
  {
    id: "pramod-sir",
    name: "Pramod Sir",
    subject: "Former Maths Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "The only way to learn mathematics is to do mathematics.",
    about: [
      "We remember Pramod Sir for his dedicated teaching and guidance in Mathematics as our previous class teacher.",
    ],
  },
  {
    id: "mantasha-maam",
    name: "Mantasha Ma'am",
    subject: "Former English Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Words have the power to change the world.",
    about: [
      "Mantasha Ma'am inspired a love for literature and language as our former English teacher.",
    ],
  },
  {
    id: "shailendra-sir",
    name: "Shailendra Sir",
    subject: "Former English Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "To read is to fly; it is to soar to a point of vantage.",
    about: [
      "We appreciate Shailendra Sir for his contributions to our English education and for fostering strong communication skills.",
    ],
  },
  {
    id: "rahul-sir",
    name: "Rahul Sir",
    subject: "Former Maths Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Numbers have a way of taking a man by the hand and leading him down the path of reason.",
    about: [
      "Rahul Sir is remembered for his clear and effective teaching methods in Mathematics.",
    ],
  },
  {
    id: "nirupma-maam",
    name: "Nirupma Ma'am",
    subject: "Former Hindi Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "The beauty of language is in its expression.",
    about: [
      "We thank Nirupma Ma'am for her dedication to teaching Hindi and its rich cultural heritage.",
    ],
  },
  {
    id: "avdesh-sir",
    name: "Avdesh Sir",
    subject: "Former IT Teacher",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Technology is a tool. In terms of getting the kids working together and motivating them, the teacher is the most important.",
    about: [
      "Avdesh Sir helped build our foundational knowledge in Information Technology with great patience and skill.",
    ],
  },
  {
    id: "kuldeep-singh",
    name: "Kuldeep Singh",
    subject: "Content Creator",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    about: [
      "With over a decade of experience, Kuldeep Singh is passionate about creating high-quality educational content that is accessible and exciting for all students.",
      "He believes in a hands-on approach to learning, encouraging students to experiment and ask questions. His goal is to foster a lifelong love for inquiry and discovery."
    ],
  },
  {
    id: "aryan-gupta",
    name: "Aryan Gupta",
    subject: "Technology & Development",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
    quote: "Technology is best when it brings people together.",
    about: [
      "As the developer behind Topper's Toolkit, Aryan Gupta focuses on creating digital tools that enhance the learning experience.",
      "He is dedicated to bridging the gap between education and technology, building platforms that are both powerful and easy to use for students and educators alike."
    ],
  },
];
