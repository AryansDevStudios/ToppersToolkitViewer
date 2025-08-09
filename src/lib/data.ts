'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, SubSubject, User } from "./types";
import { revalidatePath } from "next/cache";

// NOTE: Using local data as Firebase Admin SDK is not available.
import seedData from '../../subjects-seed.json';

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


const getSeedData = (): Subject[] => {
  return Object.entries(seedData).map(([id, subjectData]: [string, any]) => ({
    id,
    ...subjectData,
    icon: iconMap[subjectData.icon] || Book,
  }));
};

export const getSubjects = async (): Promise<Subject[]> => {
  return getSeedData();
};

export const getUsers = async (): Promise<any[]> => {
  // User management is disabled as Firebase Admin SDK is not available.
  return [];
};

export const findItemBySlug = async (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };
  const allSubjects = await getSubjects();
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

export const getAllNotes = async (): Promise<(Note & { subject: string; chapter: string; chapterId: string })[]> => {
    const allSubjects = await getSubjects();
    const allNotes: (Note & { subject: string; chapter: string; chapterId: string })[] = [];
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
                                    chapterId: `${subject.id}/${subSubject.id}/${chapter.id}`
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

export const getNoteById = async (id: string): Promise<(Note & { chapterId: string; }) | null> => {
    const notes = await getAllNotes();
    const foundNote = notes.find(note => note.id === id);
    if (!foundNote) return null;

    const allSubjects = await getSubjects();
    for (const subject of allSubjects) {
      for (const subSubject of subject.subSubjects) {
        for (const chapter of subSubject.chapters) {
          if (chapter.notes?.some(n => n.id === id)) {
            return {
              ...foundNote,
              chapterId: `${subject.id}/${subSubject.id}/${chapter.id}`
            };
          }
        }
      }
    }
    return null;
}


export const getDashboardStats = async () => {
    const notes = await getAllNotes();
    const subjects = await getSubjects();
    const totalNotes = notes.length;
    const totalSubjects = subjects.length;

    return {
        totalUsers: 0, 
        totalNotes,
        totalSubjects,
    };
}

export const getChapters = async () => {
    const allSubjects = await getSubjects();
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
    console.warn("upsertNote is not implemented because Firebase Admin SDK is not available.");
    // This is a placeholder. In a real scenario, this would interact with a database.
    revalidatePath("/admin/notes");
    return { success: true, message: `Note ${noteData.id ? 'updated' : 'created'} successfully (mock).` };
}

export const deleteNote = async (noteId: string) => {
    console.warn("deleteNote is not implemented because Firebase Admin SDK is not available.");
    // This is a placeholder. In a real scenario, this would interact with a database.
    revalidatePath("/admin/notes");
    return { success: true, message: "Note deleted successfully (mock)." };
};


export const updateUserRole = async (userId: string, newRole: User['role']) => {
    console.warn("updateUserRole is not implemented because Firebase Admin SDK is not available.");
    return { success: false, error: "Feature is disabled." };
};
