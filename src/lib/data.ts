
'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, SubSubject, User } from "./types";
import { revalidatePath } from "next/cache";

// Using local data as a fallback since Firebase Admin SDK is not available.
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

// Helper function to simulate deep cloning of the seed data to avoid mutation across requests.
const getClonedSeedData = () => JSON.parse(JSON.stringify(seedData));

export const getSubjects = async (): Promise<Subject[]> => {
  const data = getClonedSeedData();
  return Object.entries(data).map(([id, subject]: [string, any]) => ({
    ...subject,
    id,
    icon: iconMap[subject.icon] || Book,
  }));
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
                                    subject: `${subject.name} - ${subSubject.name}`,
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
      if (!subject.subSubjects) continue;
      for (const subSubject of subject.subSubjects) {
        if (!subSubject.chapters) continue;
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
        if(!subject.subSubjects) return;
        subject.subSubjects.forEach(subSubject => {
            if(!subSubject.chapters) return;
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
    console.log("DEMO MODE: Note data received:", noteData);
    // This is a demo. In a real application, you would save this to a database.
    revalidatePath("/admin/notes");
    return { success: true, message: `This is a demo. The note has been successfully created/updated in memory, but not in a database.` };
}

export const deleteNote = async (noteId: string, chapterId: string) => {
    console.log(`DEMO MODE: Deleting note ${noteId} from chapter ${chapterId}`);
    // This is a demo. In a real application, you would delete this from a database.
    revalidatePath("/admin/notes");
    return { success: true, message: "This is a demo. The note has been successfully deleted from memory, but not from the database." };
};

export const updateUserRole = async (userId: string, newRole: User['role']) => {
    console.warn("updateUserRole is not implemented because Firebase Admin SDK is not available.");
    return { success: false, error: "Feature is disabled." };
};
