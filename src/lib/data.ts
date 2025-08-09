'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, SubSubject, User } from "./types";
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
const getSeededSubjects = (): Subject[] => {
    const subjects = seedData as Record<string, Omit<Subject, 'id' | 'icon'> & { icon: string }>;
    const subjectArray: Subject[] = [];
    for (const [id, subjectData] of Object.entries(subjects)) {
        const subSubjects = subjectData.subSubjects?.map((ss: any) => ({
            ...ss,
            chapters: ss.chapters?.map((c: any) => ({
                ...c,
                notes: c.notes || [],
            })) || []
        })) || [];

        subjectArray.push({
            ...subjectData,
            id,
            icon: iconMap[subjectData.icon] || Book,
            subSubjects,
        });
    }
    return subjectArray;
};

const allSubjects = getSeededSubjects();

export const getSubjects = async (): Promise<Subject[]> => {
  return allSubjects;
};

export const getUsers = async (): Promise<any[]> => {
  // This function now returns an empty array as we can't fetch users without admin sdk.
  return [];
};

export const findItemBySlug = async (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };

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
    const notes = await getAllNotes();
    const totalNotes = notes.length;

    const subjects = await getSubjects();
    const totalSubjects = subjects.length;

    return {
        totalUsers: 0, // User data is unavailable without auth
        totalNotes,
        totalSubjects,
    };
}

export const updateUserRole = async (userId: string, newRole: User['role']) => {
    // This functionality is disabled as it requires Admin SDK.
    console.warn("updateUserRole is disabled.");
    return { success: false, error: "User management is disabled." };
};
