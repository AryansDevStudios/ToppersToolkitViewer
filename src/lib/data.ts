'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";

import type { Subject, User, Note, SubSubject, Chapter } from "./types";

// Mapping of icon names (string) to Lucide components
const iconMap: { [key: string]: React.FC<any> } = {
  FlaskConical,
  Landmark,
  Sigma,
  Book,
  Atom,
  Dna,
  BookOpen,
  Scale,
  Globe,
};

const subjects: Subject[] = [
    {
        "id": "science",
        "name": "Science",
        "icon": iconMap["FlaskConical"],
        "subSubjects": [
            {
                "id": "physics",
                "name": "Physics",
                "chapters": [
                    { "id": "motion", "name": "Motion", "notes": [] },
                    { "id": "force-and-laws-of-motion", "name": "Force and Laws of Motion", "notes": [] }
                ]
            },
            {
                "id": "chemistry",
                "name": "Chemistry",
                "chapters": [
                    { "id": "matter-in-our-surroundings", "name": "Matter in Our Surroundings", "notes": [] },
                    { "id": "is-matter-around-us-pure", "name": "Is Matter Around Us Pure", "notes": [] }
                ]
            },
            {
                "id": "biology",
                "name": "Biology",
                "chapters": [
                    { "id": "the-fundamental-unit-of-life", "name": "The Fundamental Unit of Life", "notes": [] },
                    { "id": "tissues", "name": "Tissues", "notes": [] }
                ]
            }
        ]
    },
    {
        "id": "social-science",
        "name": "Social Science",
        "icon": iconMap["Landmark"],
        "subSubjects": [
            {
                "id": "history",
                "name": "History",
                "chapters": [
                    { "id": "the-french-revolution", "name": "The French Revolution", "notes": [] },
                    { "id": "socialism-in-europe", "name": "Socialism in Europe", "notes": [] }
                ]
            },
            {
                "id": "geography",
                "name": "Geography",
                "chapters": [
                    { "id": "india-size-and-location", "name": "India - Size and Location", "notes": [] },
                    { "id": "physical-features-of-india", "name": "Physical Features of India", "notes": [] }
                ]
            },
            {
                "id": "economics",
                "name": "Economics",
                "chapters": [
                    { "id": "the-story-of-village-palampur", "name": "The Story of Village Palampur", "notes": [] },
                    { "id": "people-as-resource", "name": "People as Resource", "notes": [] }
                ]
            },
            {
                "id": "politics",
                "name": "Politics",
                "chapters": [
                    { "id": "what-is-democracy", "name": "What is Democracy? Why Democracy?", "notes": [] },
                    { "id": "constitutional-design", "name": "Constitutional Design", "notes": [] }
                ]
            }
        ]
    },
    {
        "id": "mathematics",
        "name": "Mathematics",
        "icon": iconMap["Sigma"],
        "subSubjects": [
            {
                "id": "maths-main",
                "name": "Mathematics",
                "chapters": [
                    {
                        "id": "number-systems",
                        "name": "Number Systems",
                        "notes": [
                            {
                                "id": "ns-notes-1",
                                "title": "Comprehensive Notes on Number Systems",
                                "type": "Handwritten Notes",
                                "pdfUrl": "/placeholder.pdf"
                            }
                        ]
                    },
                    { "id": "polynomials", "name": "Polynomials", "notes": [] }
                ]
            }
        ]
    },
    {
        "id": "english",
        "name": "English",
        "icon": iconMap["Book"],
        "subSubjects": [
            {
                "id": "beehive",
                "name": "Beehive",
                "chapters": [
                    { "id": "the-fun-they-had", "name": "The Fun They Had", "notes": [] },
                    { "id": "the-sound-of-music", "name": "The Sound of Music", "notes": [] }
                ]
            },
            {
                "id": "moments",
                "name": "Moments",
                "chapters": [
                    { "id": "the-lost-child", "name": "The Lost Child", "notes": [] },
                    { "id": "the-adventures-of-toto", "name": "The Adventures of Toto", "notes": [] }
                ]
            },
            {
                "id": "grammar",
                "name": "Grammar",
                "chapters": [
                    { "id": "tenses", "name": "Tenses", "notes": [] },
                    { "id": "modals", "name": "Modals", "notes": [] }
                ]
            }
        ]
    }
];


export const getSubjects = async (): Promise<Subject[]> => {
  return Promise.resolve(subjects);
};


export const getUsers = async (): Promise<User[]> => {
  // This function now returns an empty array as we can't fetch users without admin sdk.
  return [];
};

export const findItemBySlug = async (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };

  const allSubjects = await getSubjects();

  const subject = allSubjects.find(s => s.id === slug[0]);

  if (!subject) {
    return { current: null, parents: [] };
  }

  let currentItem: any = subject;
  const parents: any[] = [{ name: "Subjects", href: `/browse`, id: 'root' }];

  for (let i = 1; i < slug.length; i++) {
      const part = slug[i];
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
              name: currentItem.name,
              href: `/browse/${slug.slice(0, i).join('/')}`,
              id: currentItem.id,
          });
          currentItem = foundItem;
      } else {
          return { current: null, parents };
      }
  }
  return { current: currentItem, parents };
};

export const getAllNotes = async () => {
    const allNotes: any[] = [];
    const subjects = await getSubjects();
    for (const subject of subjects) {
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

export const getUserRole = async (uid: string): Promise<string | null> => {
  // Cannot determine role without admin sdk. Defaulting to 'User'.
  return 'User';
};

export async function updateUserRole(userId: string, newRole: 'Admin' | 'User') {
  // This function cannot work without the admin sdk.
  return { success: false, error: "This feature is currently disabled." };
}

export async function getDashboardStats() {
    try {
        const totalUsers = 0; // Cannot fetch users without admin sdk.

        const notes = await getAllNotes();
        const totalNotes = notes.length;

        const subjects = await getSubjects();
        const totalSubjects = subjects.length;

        return {
            totalUsers,
            totalNotes,
            totalSubjects,
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalUsers: 0,
            totalNotes: 0,
            totalSubjects: 0,
        };
    }
}
