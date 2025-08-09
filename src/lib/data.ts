import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, User } from "./types";

const mockSubjects: Subject[] = [
  {
    id: "science",
    name: "Science",
    icon: FlaskConical,
    subSubjects: [
      {
        id: "physics",
        name: "Physics",
        chapters: [
          { id: "motion", name: "Motion", notes: [] },
          { id: "force-and-laws-of-motion", name: "Force and Laws of Motion", notes: [] },
        ],
      },
      {
        id: "chemistry",
        name: "Chemistry",
        chapters: [
            { id: "matter-in-our-surroundings", name: "Matter in Our Surroundings", notes: [] },
            { id: "is-matter-around-us-pure", name: "Is Matter Around Us Pure", notes: [] },
        ],
      },
      {
        id: "biology",
        name: "Biology",
        chapters: [
            { id: "the-fundamental-unit-of-life", name: "The Fundamental Unit of Life", notes: [] },
            { id: "tissues", name: "Tissues", notes: [] },
        ],
      },
    ],
  },
  {
    id: "social-science",
    name: "Social Science",
    icon: Landmark,
    subSubjects: [
      {
        id: "history",
        name: "History",
        chapters: [
            { id: "the-french-revolution", name: "The French Revolution", notes: [] },
            { id: "socialism-in-europe", name: "Socialism in Europe", notes: [] },
        ],
      },
      {
        id: "geography",
        name: "Geography",
        chapters: [
            { id: "india-size-and-location", name: "India - Size and Location", notes: [] },
            { id: "physical-features-of-india", name: "Physical Features of India", notes: [] },
        ],
      },
      {
        id: "economics",
        name: "Economics",
        chapters: [
            { id: "the-story-of-village-palampur", name: "The Story of Village Palampur", notes: [] },
            { id: "people-as-resource", name: "People as Resource", notes: [] },
        ],
      },
      {
        id: "politics",
        name: "Politics",
        chapters: [
            { id: "what-is-democracy", name: "What is Democracy? Why Democracy?", notes: [] },
            { id: "constitutional-design", name: "Constitutional Design", notes: [] },
        ],
      },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Sigma,
    subSubjects: [
       {
        id: "maths-main",
        name: "Mathematics",
        chapters: [
          { id: "number-systems", name: "Number Systems", notes: [
            {
              id: "ns-notes-1",
              title: "Comprehensive Notes on Number Systems",
              type: "Handwritten Notes",
              pdfUrl: "/placeholder.pdf",
            },
          ] },
          { id: "polynomials", name: "Polynomials", notes: [] },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "English",
    icon: Book,
    subSubjects: [
      {
        id: "beehive",
        name: "Beehive",
        chapters: [
          { id: "the-fun-they-had", name: "The Fun They Had", notes: [] },
          { id: "the-sound-of-music", name: "The Sound of Music", notes: [] },
        ],
      },
       {
        id: "moments",
        name: "Moments",
        chapters: [
          { id: "the-lost-child", name: "The Lost Child", notes: [] },
          { id: "the-adventures-of-toto", name: "The Adventures of Toto", notes: [] },
        ],
      },
      {
        id: "grammar",
        name: "Grammar",
        chapters: [
            { id: "tenses", name: "Tenses", notes: [] },
            { id: "modals", name: "Modals", notes: [] },
        ]
      }
    ],
  },
];

const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@example.com", role: "Admin" },
  { id: "2", name: "Regular User", email: "user@example.com", role: "User" },
  { id: "3", name: "Jane Doe", email: "jane.doe@example.com", role: "User" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
];

export const getSubjects = () => mockSubjects;
export const getUsers = () => mockUsers;

export const findItemBySlug = (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };

  let currentItem: any = { subSubjects: mockSubjects };
  const parents = [];

  for (const part of slug) {
    let collection;
    if (currentItem.subSubjects) {
      collection = currentItem.subSubjects;
    } else if (currentItem.chapters) {
      collection = currentItem.chapters;
    } else if (currentItem.notes) {
      collection = currentItem.notes;
    } else {
      return { current: null, parents };
    }

    const foundItem = collection.find((item: any) => item.id === part);
    if (foundItem) {
      parents.push({
        name: currentItem.name || "Subjects",
        href: `/browse/${slug.slice(0, slug.indexOf(part)).join('/')}`,
        id: currentItem.id,
      });
      currentItem = foundItem;
    } else {
      return { current: null, parents };
    }
  }

  return { current: currentItem, parents };
};

export const getAllNotes = () => {
    const allNotes = [];
    for (const subject of mockSubjects) {
        if (subject.subSubjects) {
            for (const subSubject of subject.subSubjects) {
                if (subSubject.chapters) {
                    for (const chapter of subSubject.chapters) {
                        if (chapter.notes) {
                            for (const note of chapter.notes) {
                                allNotes.push({
                                    ...note,
                                    subject: subject.name,
                                    subSubject: subSubject.name,
                                    chapter: chapter.name,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return allNotes;
}