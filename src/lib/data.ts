'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, SubSubject, User } from "./types";
import seedData from '../../subjects-seed.json';
import { adminDb } from './firebase-admin';
import { revalidatePath } from "next/cache";

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
  return [];
};

export const findItemBySlug = async (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };
  const subject = allSubjects.find(s => s.id === slug[0]);
  if (!subject) return { current: null, parents: [] };

  let currentItem: any = subject;
  const parents: any[] = [{ name: "Subjects", href: `/browse`, id: 'root' }];

  for (let i = 1; i < slug.length; i++) {
      const part = slug[i];
      let collection;
      if (currentItem.subSubjects) collection = currentItem.subSubjects;
      else if (currentItem.chapters) collection = currentItem.chapters;
      else if (currentItem.notes) collection = currentItem.notes;
      else return { current: null, parents };
      
      const foundItem = collection.find((item: any) => item.id === part);
      if (foundItem) {
          parents.push({ name: currentItem.name, href: `/browse/${slug.slice(0, i).join('/')}`, id: currentItem.id });
          currentItem = foundItem;
      } else {
          return { current: null, parents };
      }
  }
  return { current: currentItem, parents };
};

export const getAllNotes = async (): Promise<(Note & { subject: string; chapter: string; })[]> => {
    const allNotes: (Note & { subject: string; chapter: string; })[] = [];
    for (const subject of allSubjects) {
        if (subject.subSubjects) {
            for (const subSubject of subject.subSubjects) {
                if (subSubject.chapters) {
                    for (const chapter of subSubject.chapters) {
                        if (chapter.notes) {
                            for (const note of chapter.notes) {
                                allNotes.push({
                                    ...note,
                                    subject: subject.name,
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

export const getNoteById = async (id: string) => {
    const notes = await getAllNotes();
    return notes.find(note => note.id === id) || null;
}

export const getDashboardStats = async () => {
    const notes = await getAllNotes();
    const totalNotes = notes.length;
    const totalSubjects = allSubjects.length;

    return {
        totalUsers: 0,
        totalNotes,
        totalSubjects,
    };
}

export const getChapters = async () => {
    const chapters: { id: string; name: string; subject: string }[] = [];
    allSubjects.forEach(subject => {
        subject.subSubjects.forEach(subSubject => {
            subSubject.chapters.forEach(chapter => {
                chapters.push({
                    id: `${subject.id}/${subSubject.id}/${chapter.id}`,
                    name: `${subject.name} - ${subSubject.name} - ${chapter.name}`,
                    subject: subject.id,
                });
            });
        });
    });
    return chapters;
};

export const upsertNote = async (noteData: Omit<Note, 'id'> & {id?: string, chapterId: string}) => {
    console.log("Upserting note:", noteData);
    // This is a placeholder as we are working with a JSON file.
    // In a real Firestore implementation, this would interact with the database.
    revalidatePath("/admin/notes");
    return { success: true, message: "Note operation successful (mock)." };
}

export const deleteNote = async (noteId: string) => {
    console.log("Deleting note:", noteId);
    // This is a placeholder.
    revalidatePath("/admin/notes");
    return { success: true, message: "Note deleted successfully (mock)." };
};


export const updateUserRole = async (userId: string, newRole: User['role']) => {
    console.warn("updateUserRole is disabled.");
    return { success: false, error: "User management is disabled." };
};
