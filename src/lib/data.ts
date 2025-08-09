'use server';

import {
  collection,
  doc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { getAdminDb } from './firebase-admin';
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";

import type { Subject } from "./types";
import seedData from '../../subjects-seed.json';

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

// Helper function to simulate seeding data if the collection is empty
const seedSubjects = async () => {
    const adminDb = getAdminDb();
    const subjectsCollection = collection(adminDb, 'subjects');
    const snapshot = await getDocs(subjectsCollection);
    if (snapshot.empty) {
        console.log('No subjects found, seeding database...');
        const subjects = seedData as Record<string, Omit<Subject, 'id' | 'icon'> & { icon: string }>;
        for (const [id, subjectData] of Object.entries(subjects)) {
            const subjectDocRef = doc(adminDb, 'subjects', id);
            await setDoc(subjectDocRef, { ...subjectData, id });
        }
        console.log('Database seeded.');
    }
};


export const getSubjects = async (): Promise<Subject[]> => {
  await seedSubjects();
  const adminDb = getAdminDb();
  const subjectsCollection = collection(adminDb, 'subjects');
  const snapshot = await getDocs(subjectsCollection);
  const subjects: Subject[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    subjects.push({
      ...data,
      icon: iconMap[data.icon as string] || Book,
    } as Subject);
  });
  return subjects;
};


export const getUsers = async (): Promise<any[]> => {
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

export const getDashboardStats = async () => {
    try {
        const notes = await getAllNotes();
        const totalNotes = notes.length;

        const subjects = await getSubjects();
        const totalSubjects = subjects.length;

        return {
            totalUsers: 0, // User data is unavailable without auth
            totalNotes,
            totalSubjects,
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback for when admin SDK might not be initialized
        const notes = await getAllNotes();
        const subjects = await getSubjects();
        return {
            totalUsers: 0,
            totalNotes: notes.length,
            totalSubjects: subjects.length,
        };
    }
}
