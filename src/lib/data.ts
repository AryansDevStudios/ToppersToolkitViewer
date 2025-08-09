
'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, User } from "./types";
import { revalidatePath } from "next/cache";
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, runTransaction } from "firebase/firestore";
import seedData from '../../subjects-seed.json';
import { v4 as uuidv4 } from 'uuid';

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

// This function seeds the database from the JSON file.
// It's designed to be run once, manually, if needed.
export const seedSubjects = async () => {
    console.log("Seeding subjects...");
    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsCollection);
    if (!subjectsSnapshot.empty) {
        console.log("Subjects collection already exists. Seeding skipped.");
        return { success: true, message: "Database already seeded." };
    }

    try {
        const batch: any[] = [];
        for (const [id, subjectData] of Object.entries(seedData)) {
            const subjectRef = doc(db, "subjects", id);
            batch.push(setDoc(subjectRef, subjectData));
        }
        // Firestore web SDK doesn't have a batched write, so we'll do them in parallel
        await Promise.all(batch);
        console.log("Seeding completed successfully.");
        return { success: true, message: "Database seeded successfully." };
    } catch (error) {
        console.error("Error seeding database:", error);
        return { success: false, error: "Failed to seed database." };
    }
};

export const getSubjects = async (): Promise<Subject[]> => {
    try {
        const subjectsCollection = collection(db, 'subjects');
        const subjectsSnapshot = await getDocs(subjectsCollection);
        if (subjectsSnapshot.empty) {
            // If the database is empty, seed it with initial data.
            await seedSubjects();
            const seededSubjectsSnapshot = await getDocs(subjectsCollection);
            return seededSubjectsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                icon: iconMap[doc.data().icon] || Book,
            })) as Subject[];
        }
        return subjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            icon: iconMap[doc.data().icon] || Book,
        })) as Subject[];
    } catch (error) {
        console.error("Error getting subjects:", error);
        return [];
    }
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
    if (!id) return null;
    const notes = await getAllNotes();
    return notes.find(note => note.id === id) || null;
}

export const getDashboardStats = async () => {
    const notes = await getAllNotes();
    const subjects = await getSubjects();
    return {
        totalNotes: notes.length,
        totalSubjects: subjects.length,
    };
}

export const getChapters = async () => {
    const allSubjects = await getSubjects();
    const chapters: { id: string; name: string; }[] = [];
    allSubjects.forEach(subject => {
        if(!subject.subSubjects) return;
        subject.subSubjects.forEach(subSubject => {
            if(!subSubject.chapters) return;
            subSubject.chapters.forEach(chapter => {
                chapters.push({
                    id: `${subject.id}/${subSubject.id}/${chapter.id}`,
                    name: `${subject.name} / ${subSubject.name} / ${chapter.name}`,
                });
            });
        });
    });
    return chapters;
};

export const upsertNote = async (noteData: Omit<Note, 'id'> & {id?: string, chapterId: string}) => {
    const { chapterId, ...note } = noteData;
    const isNew = !note.id;
    const noteId = isNew ? uuidv4() : note.id!;

    const [subjectId, subSubjectId, chapId] = chapterId.split('/');
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) {
                throw new Error("Subject not found!");
            }

            const subjectData = subjectDoc.data() as Subject;
            const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
            if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");

            const chapterIndex = subjectData.subSubjects[subSubjectIndex].chapters.findIndex(c => c.id === chapId);
            if (chapterIndex === -1) throw new Error("Chapter not found!");

            const chapter = subjectData.subSubjects[subSubjectIndex].chapters[chapterIndex];
            if (!chapter.notes) chapter.notes = [];

            if (isNew) {
                 chapter.notes.push({ ...note, id: noteId });
            } else {
                const noteIndex = chapter.notes.findIndex(n => n.id === noteId);
                if (noteIndex === -1) {
                     chapter.notes.push({ ...note, id: noteId });
                } else {
                    chapter.notes[noteIndex] = { ...note, id: noteId };
                }
            }
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });
        revalidatePath("/admin/notes");
        return { success: true, message: `Note successfully ${isNew ? 'created' : 'updated'}.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const deleteNote = async (noteId: string, chapterId: string) => {
     if (!noteId || !chapterId) return { success: false, error: "Invalid arguments" };

    const [subjectId, subSubjectId, chapId] = chapterId.split('/');
    const subjectDocRef = doc(db, "subjects", subjectId);

     try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) {
                throw new Error("Subject not found!");
            }

            const subjectData = subjectDoc.data() as Subject;
            const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
            if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");

            const chapterIndex = subjectData.subSubjects[subSubjectIndex].chapters.findIndex(c => c.id === chapId);
            if (chapterIndex === -1) throw new Error("Chapter not found!");
            
            const chapter = subjectData.subSubjects[subSubjectIndex].chapters[chapterIndex];
            const noteIndex = chapter.notes?.findIndex(n => n.id === noteId);

            if (noteIndex !== -1 && chapter.notes) {
                chapter.notes.splice(noteIndex, 1);
            } else {
                throw new Error("Note not found to delete.");
            }

            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath("/admin/notes");
        return { success: true, message: "Note deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const getUsers = async (): Promise<any[]> => {
  return [];
};

export const updateUserRole = async (userId: string, newRole: User['role']) => {
    console.warn("updateUserRole is not implemented.");
    return { success: false, error: "Feature is disabled." };
};
