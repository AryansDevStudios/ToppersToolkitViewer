
'use server';

import type { Subject, Note, Chapter, User, SubSubject, LoginLog } from "./types";
import { revalidatePath } from "next/cache";
import { db } from './firebase';
import { collection, getDocs, doc, runTransaction, writeBatch, getDoc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import seedData from '../subjects-seed.json';
import { v4 as uuidv4 } from 'uuid';
import { iconMap } from "./iconMap";

const convertToJsDelivr = (githubUrl: string): string => {
    try {
        const url = new URL(githubUrl);
        if (url.hostname !== 'github.com') return githubUrl;

        const pathParts = url.pathname.split('/');
        const user = pathParts[1];
        const repo = pathParts[2];
        const branch = pathParts[4];
        const filePath = pathParts.slice(5).join('/');
        
        if (user && repo && branch && filePath) {
            return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`;
        }
        return githubUrl;
    } catch (error) {
        return githubUrl;
    }
};

export const seedSubjects = async () => {
    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsCollection);
    if (!subjectsSnapshot.empty) {
        return { success: true, message: "Database already seeded." };
    }
    
    if (Object.keys(seedData).length === 0) {
        return { success: true, message: "Seed data is empty, nothing to seed."};
    }

    try {
        const batch = writeBatch(db);
        for (const [id, subjectData] of Object.entries(seedData)) {
            const subjectRef = doc(db, "subjects", id);
            batch.set(subjectRef, subjectData);
        }
        await batch.commit();
        return { success: true, message: "Database seeded successfully." };
    } catch (error) {
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
            })) as Subject[];
        }
        return subjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Subject[];
    } catch (error) {
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
    const users = await getUsers();
    
    return {
        totalNotes: notes.length,
        totalSubjects: subjects.length,
        totalUsers: users.length,
    };
};

export const upsertNote = async (data: { id?: string; subjectId: string; subSubjectId: string; chapterName: string; type: string; pdfUrl: string; linkType: 'github' | 'other'; serveViaJsDelivr: boolean; icon?: string; }) => {
    const { id, subjectId, subSubjectId, pdfUrl: originalUrl, icon, linkType, serveViaJsDelivr } = data;
    const isNewNote = !id;
    const noteId = isNewNote ? uuidv4() : id!;
    const trimmedChapterName = data.chapterName.trim();
    const trimmedType = data.type.trim();

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

            let chapterIndex = subSubject.chapters.findIndex(c => c.name.trim().toLowerCase() === trimmedChapterName.toLowerCase());

            if (chapterIndex === -1) {
                // Chapter doesn't exist, create it
                const newChapter: Chapter = {
                    id: uuidv4(),
                    name: trimmedChapterName,
                    notes: [],
                };
                subSubject.chapters.push(newChapter);
                chapterIndex = subSubject.chapters.length - 1;
            }

            const jsDelivrUrl = linkType === 'github' ? convertToJsDelivr(originalUrl) : originalUrl;
            
            const newNote: Note = { 
                id: noteId, 
                type: trimmedType, 
                pdfUrl: serveViaJsDelivr ? jsDelivrUrl : originalUrl,
                originalPdfUrl: originalUrl,
                linkType,
                serveViaJsDelivr,
                icon: icon || undefined,
                createdAt: oldNoteData?.createdAt ?? Date.now(),
             };
            if(isNewNote) newNote.createdAt = Date.now();

            subSubject.chapters[chapterIndex].notes.push(newNote);
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath("/admin/notes");
        revalidatePath("/admin/subjects");
        revalidatePath("/browse", "layout");
        revalidatePath("/admin");
        return { success: true, message: `Note successfully ${isNewNote ? 'created' : 'updated'}.` };
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
        revalidatePath("/admin/subjects");
        revalidatePath("/browse", "layout");
        revalidatePath("/admin");
        return { success: true, message: "Note deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

// --- Subject/Chapter Management ---

export const upsertSubject = async (data: { id?: string, name: string, icon: string }) => {
    const { id } = data;
    const name = data.name.trim();
    const icon = data.icon.trim();
    const isNew = !id;
    const subjectId = isNew ? uuidv4() : id!;
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
        if (isNew) {
            const newSubject: Omit<Subject, 'id'| 'icon'> & { icon: string } = {
                name,
                icon,
                subSubjects: []
            };
            await runTransaction(db, async (transaction) => {
                transaction.set(subjectDocRef, newSubject);
            });
        } else {
            await runTransaction(db, async (transaction) => {
                transaction.update(subjectDocRef, { name, icon });
            });
        }
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: `Subject successfully ${isNew ? 'created' : 'updated'}.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const deleteSubject = async (subjectId: string) => {
    const subjectDocRef = doc(db, "subjects", subjectId);
    try {
        await deleteDoc(subjectDocRef);
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: "Subject deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const upsertSubSubject = async (data: { subjectId: string, id?: string, name: string, icon?: string }) => {
    const { subjectId, id } = data;
    const name = data.name.trim();
    const icon = data.icon?.trim();
    const isNew = !id;
    const subSubjectId = isNew ? uuidv4() : id!;
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;
            
            if (isNew) {
                const newSubSubject: SubSubject = { id: subSubjectId, name, icon: icon || 'Folder', chapters: [] };
                subjectData.subSubjects.push(newSubSubject);
            } else {
                const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
                if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");
                subjectData.subSubjects[subSubjectIndex].name = name;
                subjectData.subSubjects[subSubjectIndex].icon = icon || 'Folder';
            }
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: `Sub-subject successfully ${isNew ? 'created' : 'updated'}.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const deleteSubSubject = async (subjectId: string, subSubjectId: string) => {
    const subjectDocRef = doc(db, "subjects", subjectId);
    try {
         await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;
            
            subjectData.subSubjects = subjectData.subSubjects.filter(ss => ss.id !== subSubjectId);
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: "Sub-subject deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const upsertChapter = async (data: { subjectId: string, subSubjectId: string, id?: string, name: string }) => {
    const { subjectId, subSubjectId, id } = data;
    const name = data.name.trim();
    const isNew = !id;
    const chapterId = isNew ? uuidv4() : id!;
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
         await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;
            const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
            if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");
            
            const subSubject = subjectData.subSubjects[subSubjectIndex];
            if (!subSubject.chapters) subSubject.chapters = [];

            if(isNew) {
                const newChapter: Chapter = { id: chapterId, name, notes: [] };
                subSubject.chapters.push(newChapter);
            } else {
                const chapterIndex = subSubject.chapters.findIndex(c => c.id === chapterId);
                if (chapterIndex === -1) throw new Error("Chapter not found!");
                subSubject.chapters[chapterIndex].name = name;
            }
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: `Chapter successfully ${isNew ? 'created' : 'updated'}.` };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
};

export const deleteChapter = async (subjectId: string, subSubjectId: string, chapterId: string) => {
    const subjectDocRef = doc(db, "subjects", subjectId);
    try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;
            const subSubjectIndex = subjectData.subSubjects.findIndex(ss => ss.id === subSubjectId);
            if (subSubjectIndex === -1) throw new Error("Sub-subject not found!");
            
            const subSubject = subjectData.subSubjects[subSubjectIndex];
            if(subSubject.chapters) {
                subSubject.chapters = subSubject.chapters.filter(c => c.id !== chapterId);
            }
            
            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/", "layout");
        revalidatePath("/admin");
        return { success: true, message: "Chapter deleted successfully." };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
};

// --- User Management ---

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    return null;
  }
};


export const getUsers = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    return [];
  }
};

export const upsertUser = async (userData: Partial<User> & { id: string }) => {
    const { id, ...dataToUpdate } = userData;
    if (!id) {
        return { success: false, error: "User ID is required for updates." };
    }

    const userDocRef = doc(db, 'users', id);
    try {
        // Ensure password is not part of the update from this function
        const { password, ...restOfData } = dataToUpdate;
        await setDoc(userDocRef, restOfData, { merge: true });
        revalidatePath('/admin/users');
        return { success: true, message: "User updated successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const updateUserRole = async (userId: string, newRole: User['role']) => {
    if (!userId || !newRole) {
        return { success: false, error: "Invalid arguments provided."};
    }
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { role: newRole });
        revalidatePath('/admin/users');
        return { success: true, message: "User role updated successfully." };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
};

export const updateUserNoteAccess = async (userId: string, noteId: string, hasAccess: boolean) => {
    if (!userId || !noteId) {
        return { success: false, error: "Invalid arguments provided." };
    }
    const userDocRef = doc(db, "users", userId);
    try {
        if (hasAccess) {
            await updateDoc(userDocRef, {
                noteAccess: arrayUnion(noteId)
            });
        } else {
            await updateDoc(userDocRef, {
                noteAccess: arrayRemove(noteId)
            });
        }
        revalidatePath('/admin/users');
        revalidatePath('/browse', "layout");
        return { success: true, message: `Access for note ${noteId} updated.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};


export const deleteUser = async (userId: string) => {
    // This action is sensitive and has been disabled in the code
    // as it might require cleaning up Firebase Auth user as well,
    // which cannot be done from the client-side without admin privileges.
    // For now, it just deletes the Firestore document.
    if (!userId) {
        return { success: false, error: "Invalid user ID."};
    }
    const userDocRef = doc(db, 'users', userId);
    try {
        await deleteDoc(userDocRef);
        revalidatePath('/admin/users');
        return { success: true, message: "User data deleted from Firestore." };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
};

export const updatePasswordInFirestore = async (userId: string, password: string) => {
    if (!userId || !password) {
        return { success: false, error: "Invalid user ID or password." };
    }
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { password });
        return { success: true, message: "Password updated in Firestore." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const logUserLogin = async (userId: string, loginData: Omit<LoginLog, 'timestamp'>) => {
    if (!userId) {
        return { success: false, error: "User ID is required." };
    }
    const userDocRef = doc(db, 'users', userId);
    const newLog: LoginLog = {
        ...loginData,
        timestamp: Date.now(),
    };

    try {
        // Use setDoc with merge to create the field if it doesn't exist, or update it if it does.
        await setDoc(userDocRef, { loginLogs: arrayUnion(newLog) }, { merge: true });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};
