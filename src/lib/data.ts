
'use server';

import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";
import type { Subject, Note, Chapter, User } from "./types";
import { revalidatePath } from "next/cache";
import { db } from './firebase';
import { collection, getDocs, doc, runTransaction, writeBatch, getDoc } from "firebase/firestore";
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

export const seedSubjects = async () => {
    console.log("Seeding subjects...");
    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsCollection);
    if (!subjectsSnapshot.empty) {
        console.log("Subjects collection already exists. Seeding skipped.");
        return { success: true, message: "Database already seeded." };
    }

    try {
        const batch = writeBatch(db);
        for (const [id, subjectData] of Object.entries(seedData)) {
            const subjectRef = doc(db, "subjects", id);
            batch.set(subjectRef, subjectData);
        }
        await batch.commit();
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
  if (!slug || slug.length === 0) {
    const allSubjects = await getSubjects();
    return { current: { name: 'Browse', children: allSubjects, isRoot: true }, parents: [] };
  }
  
  const allSubjects = await getSubjects();
  const subject = allSubjects.find(s => s.id === slug[0]);
  if (!subject) return { current: null, parents: [] };

  let currentItem: any = subject;
  const parents: any[] = [{ name: "Browse", href: `/browse`, id: 'root' }];
  
  for (let i = 1; i < slug.length; i++) {
    const part = slug[i];
    let foundItem = null;

    if (currentItem.subSubjects) {
      foundItem = currentItem.subSubjects.find((item: any) => item.id === part);
    }
    
    if (!foundItem && currentItem.chapters) {
        for (const chapter of currentItem.chapters) {
            if (chapter.notes) {
                foundItem = chapter.notes.find((note: any) => note.id === part);
                if (foundItem) {
                    parents.push({ name: currentItem.name, href: `/browse/${slug.slice(0, i).join('/')}`, id: currentItem.id });
                    currentItem = foundItem;
                    return { current: currentItem, parents };
                }
            }
        }
    }
    
    if (foundItem) {
        parents.push({ name: currentItem.name, href: `/browse/${slug.slice(0, i).join('/')}`, id: currentItem.id });
        currentItem = foundItem;
    } else {
        return { current: null, parents };
    }
  }

  return { current: currentItem, parents };
};

export const getAllNotes = async (): Promise<(Note & { subject: string; chapter: string; chapterId: string; slug: string })[]> => {
    const allSubjects = await getSubjects();
    const allNotes: (Note & { subject: string; chapter: string; chapterId: string; slug: string })[] = [];
    for (const subject of allSubjects) {
        if (subject.subSubjects) {
            for (const subSubject of subject.subSubjects) {
                if (subSubject.chapters) {
                    for (const chapter of subSubject.chapters) {
                        if (chapter.notes) {
                            for (const note of chapter.notes) {
                                allNotes.push({
                                    ...note,
                                    subject: `${subject.name} / ${subSubject.name}`,
                                    chapter: chapter.name,
                                    chapterId: `${subject.id}/${subSubject.id}/${chapter.id}`,
                                    slug: `/browse/${subject.id}/${subSubject.id}/${note.id}`
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return allNotes;
};

export const getNoteById = async (id: string): Promise<(Note & { subjectId: string; subSubjectId: string; chapterId: string; chapterName: string; }) | null> => {
    if (!id) return null;
    const allSubjects = await getSubjects();
    for (const subject of allSubjects) {
        if (subject.subSubjects) {
            for (const subSubject of subject.subSubjects) {
                if (subSubject.chapters) {
                    for (const chapter of subSubject.chapters) {
                        if (chapter.notes) {
                            const note = chapter.notes.find(n => n.id === id);
                            if (note) {
                                return {
                                    ...note,
                                    subjectId: subject.id,
                                    subSubjectId: subSubject.id,
                                    chapterId: chapter.id,
                                    chapterName: chapter.name
                                };
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
};

export const getDashboardStats = async () => {
    const notes = await getAllNotes();
    const subjects = await getSubjects();
    return {
        totalNotes: notes.length,
        totalSubjects: subjects.length,
    };
};

export const upsertNote = async (data: { id?: string; subjectId: string; subSubjectId: string; chapterName: string; type: string; pdfUrl: string; }) => {
    const { id, subjectId, subSubjectId, chapterName, type, pdfUrl } = data;
    const isNewNote = !id;
    const noteId = isNewNote ? uuidv4() : id!;

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
            
            const subSubject = subjectData.subSubjects[subSubjectIndex];
            if (!subSubject.chapters) subSubject.chapters = [];

            let oldNoteData: Note | undefined;

            // If updating, first remove the old note to get its data
            if (!isNewNote) {
                subjectData.subSubjects.forEach(ss => {
                    ss.chapters.forEach(c => {
                        const noteIndex = c.notes.findIndex(n => n.id === noteId);
                        if (noteIndex > -1) {
                           oldNoteData = c.notes[noteIndex];
                           c.notes.splice(noteIndex, 1);
                        }
                    });
                });
            }

            let chapterIndex = subSubject.chapters.findIndex(c => c.name.toLowerCase() === chapterName.toLowerCase());

            if (chapterIndex === -1) {
                // Chapter doesn't exist, create it
                const newChapter: Chapter = {
                    id: uuidv4(),
                    name: chapterName,
                    notes: [],
                };
                subSubject.chapters.push(newChapter);
                chapterIndex = subSubject.chapters.length - 1;
            }

            const newNote: Note = { 
                id: noteId, 
                type, 
                pdfUrl,
                createdAt: oldNoteData?.createdAt ?? Date.now(),
             };
            if(isNewNote) newNote.createdAt = Date.now();

            subSubject.chapters[chapterIndex].notes.push(newNote);
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath("/admin/notes");
        revalidatePath("/browse");
        revalidatePath(`/browse/${subjectId}/${subSubjectId}`);
        return { success: true, message: `Note successfully ${isNewNote ? 'created' : 'updated'}.` };
    } catch (e: any) {
        console.error("Upsert failed: ", e);
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
            if (!subjectDoc.exists()) throw new Error("Subject not found!");

            const subjectData = subjectDoc.data() as Subject;
            const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
            if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");

            const chapterIndex = subjectData.subSubjects[subSubjectIndex].chapters.findIndex(c => c.id === chapId);
            if (chapterIndex === -1) throw new Error("Chapter not found!");
            
            const chapter = subjectData.subSubjects[subSubjectIndex].chapters[chapterIndex];
            if (!chapter.notes) throw new Error("Note not found in chapter.");

            const noteIndex = chapter.notes.findIndex(n => n.id === noteId);
            if (noteIndex !== -1) {
                chapter.notes.splice(noteIndex, 1);
            } else {
                throw new Error("Note not found to delete.");
            }

            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath("/admin/notes");
        revalidatePath("/browse");
        revalidatePath(`/browse/${subjectId}/${subSubjectId}`);
        return { success: true, message: "Note deleted successfully." };
    } catch (e: any) {
        console.error("Delete failed: ", e);
        return { success: false, error: e.message };
    }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};


export const getUsers = async (): Promise<any[]> => {
  return [];
};

export const updateUserRole = async (userId: string, newRole: User['role']) => {
    console.warn("updateUserRole is not implemented.");
    return { success: false, error: "Feature is disabled." };
};
