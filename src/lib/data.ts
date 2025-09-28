
'use server';

import type { Subject, Note, Chapter, User, SubSubject, LoginLog, QuestionOfTheDay, UserQotdAnswer, Notice, Doubt, MCQ, MCQSet, PrintOrder, AppSettings, QuizAttempt, Complaint, Subscription } from "./types";
import { revalidatePath } from "next/cache";
import { db } from './firebase';
import { collection, getDocs, doc, runTransaction, writeBatch, getDoc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove, query, where, orderBy, limit, serverTimestamp, type WriteBatch } from "firebase/firestore";
import seedData from '../subjects-seed.json';
import { v4 as uuidv4 } from 'uuid';
import { iconMap } from "./iconMap";
import { unstable_noStore as noStore } from 'next/cache';
import { z } from "zod";

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

const convertToProxyUrl = (url: string): string => {
    if (!url) return '';
    const proxyBase = 'https://topperstoolkitviewer.netlify.app/.netlify/functions/proxy?url=';
    try {
        // Avoid double-encoding
        if (url.startsWith(proxyBase)) {
            return url;
        }
        return `${proxyBase}${encodeURIComponent(url)}`;
    } catch (e) {
        return url;
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
        revalidatePath("/", "layout");
        return { success: true, message: "Database seeded successfully." };
    } catch (error) {
        return { success: false, error: "Failed to seed database." };
    }
};

export const getSubjects = async (): Promise<Subject[]> => {
    noStore();
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
  noStore();
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

export const getAllNotes = async (): Promise<(Note & { subjectName: string; subSubjectName: string; chapter: string; chapterId: string; slug: string })[]> => {
    noStore();
    const allSubjects = await getSubjects();
    const allNotes: (Note & { subjectName: string; subSubjectName: string; chapter: string; chapterId: string; slug: string })[] = [];
    for (const subject of allSubjects) {
        if (subject.subSubjects) {
            for (const subSubject of subject.subSubjects) {
                if (subSubject.chapters) {
                    for (const chapter of subSubject.chapters) {
                        if (chapter.notes) {
                            for (const note of chapter.notes) {
                                allNotes.push({
                                    ...note,
                                    id: note.id, // Ensure the note's unique ID is used
                                    subjectName: subject.name,
                                    subSubjectName: subSubject.name,
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

export const getNoteById = async (id: string): Promise<(Note & { subjectId: string; subSubjectId: string; chapterId: string; chapterName: string; subjectName: string; subSubjectName: string; slug: string; }) | null> => {
    noStore();
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
                                    chapterName: chapter.name,
                                    subjectName: subject.name,
                                    subSubjectName: subSubject.name,
                                    slug: `/browse/${subject.id}/${subSubject.id}/${note.id}`
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
    noStore();
    const notes = await getAllNotes();
    const subjects = await getSubjects();
    const users = await getUsers();
    const allOrders = await getAllPrintOrders();
    const pendingOrders = allOrders.filter(o => o.status === 'pending');
    const allComplaints = await getAllComplaints();
    const pendingComplaints = allComplaints.filter(c => c.status === 'pending');
    const allDoubts = await getAllDoubts();
    const pendingDoubts = allDoubts.filter(d => d.status === 'pending');
    
    return {
        totalNotes: notes.length,
        totalSubjects: subjects.length,
        totalUsers: users.length,
        totalPendingOrders: pendingOrders.length,
        totalPendingComplaints: pendingComplaints.length,
        totalPendingDoubts: pendingDoubts.length,
    };
};

export const upsertNote = async (data: { id?: string; subjectId: string; subSubjectId: string; chapterName: string; type: string; url: string; renderAs: 'pdf' | 'iframe'; linkType?: 'github' | 'other'; serveViaJsDelivr?: boolean; useProxy?: boolean; icon?: string; isPublic?: boolean; }) => {
    const { id, subjectId, subSubjectId, url: originalUrl, icon, linkType, serveViaJsDelivr, useProxy, isPublic, renderAs } = data;
    const isNewNote = !id;
    const noteId = isNewNote ? uuidv4() : id!;
    const trimmedChapterName = data.chapterName.trim();
    const trimmedType = data.type.trim();

    try {
        await runTransaction(db, async (transaction) => {
            const allSubjectsDocs = await getDocs(collection(db, 'subjects'));
            let allSubjects = allSubjectsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));

            // --- Read/Find Phase ---
            let oldNoteData: Note | null = null;
            let oldNoteLocation: {subject: Subject, subSubject: SubSubject, chapter: Chapter} | null = null;

            if (!isNewNote) {
                for (const subj of allSubjects) {
                    for (const ss of subj.subSubjects) {
                        for (const chap of ss.chapters) {
                            const note = chap.notes.find(n => n.id === noteId);
                            if (note) {
                                oldNoteData = note;
                                oldNoteLocation = {subject: subj, subSubject: ss, chapter: chap};
                                break;
                            }
                        }
                        if (oldNoteData) break;
                    }
                    if (oldNoteData) break;
                }
            }
            
            const targetSubject = allSubjects.find(s => s.id === subjectId);
            if (!targetSubject) throw new Error("Target subject not found!");
            
            const targetSubSubject = targetSubject.subSubjects.find(ss => ss.id === subSubjectId);
            if (!targetSubSubject) throw new Error("Target sub-subject not found!");

            // --- Write/Update Phase ---
            // 1. Remove the old note if it exists.
            if (oldNoteLocation) {
                 const noteIndex = oldNoteLocation.chapter.notes.findIndex(n => n.id === noteId);
                if (noteIndex > -1) {
                    oldNoteLocation.chapter.notes.splice(noteIndex, 1);
                }
                const sourceSubjectRef = doc(db, "subjects", oldNoteLocation.subject.id);
                transaction.set(sourceSubjectRef, oldNoteLocation.subject);
            }
            
            // 2. Add the new/updated note to the target location
            if (!targetSubSubject.chapters) targetSubSubject.chapters = [];
            
            let targetChapter = targetSubSubject.chapters.find(c => c.name.trim().toLowerCase() === trimmedChapterName.toLowerCase());

            if (!targetChapter) {
                targetChapter = { id: uuidv4(), name: trimmedChapterName, notes: [] };
                targetSubSubject.chapters.push(targetChapter);
            }

             if (targetChapter.notes.some(note => note.type.trim().toLowerCase() === trimmedType.toLowerCase() && note.id !== noteId)) {
                throw new Error(`A note of type "${trimmedType}" already exists in chapter "${trimmedChapterName}".`);
            }
            
            let finalUrl = originalUrl;
            if (renderAs === 'pdf' && linkType === 'github' && serveViaJsDelivr) {
                finalUrl = convertToJsDelivr(originalUrl);
            } else if (renderAs === 'pdf' && linkType === 'other' && useProxy) {
                finalUrl = convertToProxyUrl(originalUrl);
            }
            
            const newNote: Partial<Note> = { 
                id: noteId,
                type: trimmedType, 
                url: finalUrl,
                originalUrl: originalUrl,
                renderAs,
                linkType: linkType,
                serveViaJsDelivr: serveViaJsDelivr,
                useProxy: useProxy,
                icon: icon || 'FileText',
                createdAt: oldNoteData?.createdAt ?? Date.now(),
                isPublic: isPublic || false,
             };
             
            // Remove undefined fields before saving
            Object.keys(newNote).forEach(key => (newNote as any)[key] === undefined && delete (newNote as any)[key]);

            const existingNoteIndex = targetChapter.notes.findIndex(n => n.id === noteId);
            if (existingNoteIndex > -1) {
                targetChapter.notes[existingNoteIndex] = newNote as Note;
            } else {
                targetChapter.notes.push(newNote as Note);
            }
            
            const targetSubjectRef = doc(db, "subjects", targetSubject.id);
            transaction.set(targetSubjectRef, targetSubject);
        });

        revalidatePath("/admin/notes", "layout");
        revalidatePath("/browse", "layout");
        return { success: true, message: `Note successfully ${isNewNote ? 'created' : 'updated'}.` };
    } catch (e: any) {
        console.error("Error in upsertNote:", e);
        return { success: false, error: e.message || "An unknown error occurred" };
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
            const subSubject = subjectData.subSubjects.find(ss => ss.id === subSubjectId);
            if (!subSubject) throw new Error("Sub-subject not found!");

            const chapterIndex = subSubject.chapters.findIndex(c => c.id === chapId);
            if (chapterIndex === -1) throw new Error("Chapter not found!");
            
            const chapter = subSubject.chapters[chapterIndex];

            const noteIndex = chapter.notes.findIndex(n => n.id === noteId);
            if (noteIndex !== -1) {
                chapter.notes.splice(noteIndex, 1);

                // If the chapter is now empty, remove it.
                if (chapter.notes.length === 0) {
                    subSubject.chapters.splice(chapterIndex, 1);
                }
            } else {
                throw new Error("Note not found to delete.");
            }
            
             // If the sub-subject is now empty of chapters, remove it
            if (subSubject.chapters.length === 0) {
                subjectData.subSubjects = subjectData.subSubjects.filter(ss => ss.id !== subSubjectId);
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
            const subSubject = subjectData.subSubjects.find(ss => ss.id === subSubjectId);
            if (!subSubject) throw new Error("Sub-subject not found!");
            
            if(subSubject.chapters) {
                subSubject.chapters = subSubject.chapters.filter(c => c.id !== chapterId);

                // If sub-subject is now empty of chapters, remove it.
                if (subSubject.chapters.length === 0) {
                    subjectData.subSubjects = subjectData.subSubjects.filter(ss => ss.id !== subSubjectId);
                }
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
  noStore();
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
  noStore();
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

export const upsertUser = async (userData: Partial<User> & { id: string }, batch?: WriteBatch) => {
    const { id, ...dataToUpdate } = userData;
    if (!id) {
        return { success: false, error: "User ID is required for updates." };
    }

    const userDocRef = doc(db, 'users', id);

    try {
        if (Object.keys(dataToUpdate).length > 0) {
            if (batch) {
                batch.set(userDocRef, dataToUpdate, { merge: true });
            } else {
                await setDoc(userDocRef, dataToUpdate, { merge: true });
            }
        }
        
        // Revalidation is handled by the calling function if it's not a batch operation
        if (!batch) {
            revalidatePath('/admin/users', 'layout');
            revalidatePath('/admin/leaderboard');
            revalidatePath('/leaderboard');
            revalidatePath('/mcqs');
        }

        return { success: true, message: "User updated successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const batchUpdateUsers = async (usersData: (Partial<User> & { id: string })[]) => {
    const batch = writeBatch(db);

    for (const userData of usersData) {
        const { id, ...dataToUpdate } = userData;
        if (id && Object.keys(dataToUpdate).length > 0) {
            const userDocRef = doc(db, 'users', id);
            batch.set(userDocRef, dataToUpdate, { merge: true });
        }
    }

    try {
        await batch.commit();
        revalidatePath('/admin/users', 'layout');
        revalidatePath('/admin/leaderboard');
        revalidatePath('/leaderboard');
        return { success: true, message: "Users updated successfully." };
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

export const updateUserPermissions = async (
    userId: string, 
    permissions: {
        noteAccess?: string[];
        hasAiAccess?: boolean;
        hasFullNotesAccess?: boolean;
        attemptedQuizzes?: string[];
    }
) => {
    if (!userId) {
        return { success: false, error: "User ID is required." };
    }
    const userDocRef = doc(db, "users", userId);
    try {
        // Construct an update object with only the provided fields
        const dataToUpdate: { [key: string]: any } = {};
        if (permissions.noteAccess !== undefined) {
            dataToUpdate.noteAccess = permissions.noteAccess;
        }
        if (permissions.hasAiAccess !== undefined) {
            dataToUpdate.hasAiAccess = permissions.hasAiAccess;
        }
        if (permissions.hasFullNotesAccess !== undefined) {
            dataToUpdate.hasFullNotesAccess = permissions.hasFullNotesAccess;
        }
         if (permissions.attemptedQuizzes !== undefined) {
            dataToUpdate.attemptedQuizzes = permissions.attemptedQuizzes;
        }
        
        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true, message: "No permissions were changed." };
        }

        await updateDoc(userDocRef, dataToUpdate);
        
        revalidatePath('/admin/users', 'layout');
        revalidatePath('/browse', "layout");
        revalidatePath('/mcqs');
        return { success: true, message: "User permissions updated successfully." };
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

export const startDemo = async (userId: string) => {
    if (!userId) {
        return { success: false, error: "User ID is required." };
    }
    const userDocRef = doc(db, 'users', userId);
    const demoDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const expiresAt = Date.now() + demoDuration;

    try {
        await updateDoc(userDocRef, { demoExpiresAt: expiresAt });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
};

// --- Question of the Day ---

export async function getQuestionsOfTheDay(): Promise<QuestionOfTheDay[]> {
  noStore();
  const qotdCollection = collection(db, 'qotd');
  const qotdSnapshot = await getDocs(query(qotdCollection, orderBy('date', 'desc')));
  return qotdSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionOfTheDay));
}

export async function getQuestionOfTheDay(date: string): Promise<QuestionOfTheDay | null> {
    noStore();
    const qotdCollection = collection(db, 'qotd');
    const q = query(qotdCollection, where('date', '==', date), limit(1));
    const qotdSnapshot = await getDocs(q);

    if (!qotdSnapshot.empty) {
        return { id: qotdSnapshot.docs[0].id, ...qotdSnapshot.docs[0].data() } as QuestionOfTheDay;
    }

    // If no question for today, get the most recent past or present one
    const pastOrPresentQuery = query(
        qotdCollection,
        where('date', '<=', date),
        orderBy('date', 'desc'),
        limit(1)
    );
    const recentSnapshot = await getDocs(pastOrPresentQuery);
    if (recentSnapshot.empty) return null;
    
    return { id: recentSnapshot.docs[0].id, ...recentSnapshot.docs[0].data() } as QuestionOfTheDay;
}

export async function upsertQuestionOfTheDay(questionData: Omit<QuestionOfTheDay, 'id' | 'createdAt'> & { id?: string }) {
  const { id, ...data } = questionData;
  const isNew = !id;
  const docId = isNew ? uuidv4() : id;
  const qotdDocRef = doc(db, 'qotd', docId);

  try {
    if (isNew) {
      // Use Firestore serverTimestamp for reliable time, getNotices will convert it
      const docWithMeta = { ...data, id: docId, createdAt: Date.now() };
      await setDoc(qotdDocRef, docWithMeta);
    } else {
      await updateDoc(qotdDocRef, data);
    }
    revalidatePath('/admin/qotd');
    revalidatePath('/puzzle-quiz');
    return { success: true, message: `Question successfully ${isNew ? 'created' : 'updated'}.` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteQuestionOfTheDay(id: string) {
  if (!id) return { success: false, error: "Question ID is required." };
  const qotdDocRef = doc(db, 'qotd', id);
  try {
    await deleteDoc(qotdDocRef);
    revalidatePath('/admin/qotd');
    revalidatePath('/puzzle-quiz');
    return { success: true, message: "Question deleted successfully." };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

const optionSchema = z.object({
  text: z.string(),
});

const qotdObjectSchema = z.object({
  question: z.string(),
  options: z.array(optionSchema),
  correctOptionIndex: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
});

const bulkQotdSchema = z.array(qotdObjectSchema);

export async function bulkCreateQuestionsOfTheDay(jsonString: string) {
    let questions;
    try {
        const jsonData = JSON.parse(jsonString);
        questions = bulkQotdSchema.parse(jsonData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: `Validation Error: ${error.errors[0].path.join('.')} - ${error.errors[0].message}` };
        }
        return { success: false, error: "Invalid JSON format." };
    }

    if (questions.length === 0) {
        return { success: false, error: "JSON array is empty." };
    }

    const batch = writeBatch(db);
    let count = 0;

    for (const questionData of questions) {
        const docId = uuidv4();
        const qotdDocRef = doc(db, 'qotd', docId);
        const newQuestion: Omit<QuestionOfTheDay, 'id'> = {
            ...questionData,
            id: docId,
            createdAt: Date.now(),
        };
        batch.set(qotdDocRef, newQuestion);
        count++;
    }

    try {
        await batch.commit();
        revalidatePath('/admin/qotd');
        revalidatePath('/puzzle-quiz');
        return { success: true, count };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


export async function getUserQotdAnswers(userId: string): Promise<UserQotdAnswer[] | null> {
    noStore();
    if (!userId) return null;

    const answerDocRef = doc(db, 'qotd_answers', userId);
    const answerDoc = await getDoc(answerDocRef);

    if (answerDoc.exists()) {
        const data = answerDoc.data();
        return data.answers as UserQotdAnswer[];
    }
    return null;
}

export async function getAllQotdAnswers(): Promise<{ userId: string, answers: UserQotdAnswer[] }[]> {
    noStore();
    const answersCollection = collection(db, 'qotd_answers');
    const answersSnapshot = await getDocs(answersCollection);
    return answersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            userId: doc.id,
            answers: data.answers as UserQotdAnswer[]
        };
    });
}


export async function submitUserAnswer(userId: string, questionId: string, selectedOptionIndex: number) {
  noStore();
  const qotdDocRef = doc(db, 'qotd', questionId);
  const answerDocRef = doc(db, 'qotd_answers', userId);
  const userDocRef = doc(db, 'users', userId);

  try {
    return await runTransaction(db, async (transaction) => {
      // --- ALL READS MUST GO FIRST ---
      const qotdDoc = await transaction.get(qotdDocRef);
      const answerDoc = await transaction.get(answerDocRef);
      const userDoc = await transaction.get(userDocRef);

      if (!qotdDoc.exists()) {
        throw new Error("Question not found.");
      }
      if (answerDoc.exists()) {
        const existingAnswers = answerDoc.data().answers as UserQotdAnswer[];
        if (existingAnswers.some(ans => ans.questionId === questionId)) {
          throw new Error("You have already answered this question.");
        }
      }
      
      const qotdData = qotdDoc.data() as QuestionOfTheDay;
      const isCorrect = qotdData.correctOptionIndex === selectedOptionIndex;

      // --- ALL WRITES GO AFTER READS ---
      const newAnswer: UserQotdAnswer = {
        questionId,
        question: qotdData.question,
        selectedOptionIndex,
        isCorrect,
        answeredAt: Date.now(),
      };

      if (answerDoc.exists()) {
        transaction.update(answerDocRef, { answers: arrayUnion(newAnswer) });
      } else {
        transaction.set(answerDocRef, { userId, answers: [newAnswer] });
      }
      
      if (isCorrect) {
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          const currentScore = userData.score || 0;
          const newScore = currentScore + 2;
          transaction.update(userDocRef, { score: newScore });
        }
      }

      return { success: true, isCorrect, correctOptionIndex: qotdData.correctOptionIndex };
    });
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteUserQotdAnswer(userId: string, questionId: string) {
  if (!userId || !questionId) {
    return { success: false, error: "User ID and Question ID are required." };
  }

  const answerDocRef = doc(db, 'qotd_answers', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const answerDoc = await transaction.get(answerDocRef);
      if (!answerDoc.exists()) {
        // If the document doesn't exist, there's nothing to delete.
        return;
      }

      const docData = answerDoc.data();
      const existingAnswers: UserQotdAnswer[] = docData.answers || [];
      
      // Find the answer to remove
      const answerToRemove = existingAnswers.find(ans => ans.questionId === questionId);

      if (answerToRemove) {
        // Use arrayRemove to atomically remove the element from the array
        transaction.update(answerDocRef, {
          answers: arrayRemove(answerToRemove)
        });
      }
    });

    revalidatePath('/admin/qotd');
    return { success: true, message: "User's answer has been deleted." };
  } catch (e: any) {
    console.error("Error deleting user QOTD answer:", e);
    return { success: false, error: e.message || "An unknown error occurred while deleting the answer." };
  }
}


// --- Notices Management ---

export async function getNotices(): Promise<Notice[]> {
  noStore();
  const noticesCollection = collection(db, 'notices');
  const q = query(noticesCollection, orderBy('createdAt', 'desc'));
  const noticesSnapshot = await getDocs(q);
  
  return noticesSnapshot.docs.map(doc => {
    const data = doc.data();
    // Ensure createdAt is a number. If it's a Timestamp, convert it.
    const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || 0);
    return { id: doc.id, ...data, createdAt } as Notice;
  });
}

export async function upsertNotice(noticeData: Omit<Notice, 'id' | 'createdAt'> & { id?: string }) {
  const { id, ...data } = noticeData;
  const isNew = !id;
  const docId = isNew ? uuidv4() : id;
  const noticeDocRef = doc(db, 'notices', docId);

  try {
    if (isNew) {
      // Use Firestore serverTimestamp for reliable time, getNotices will convert it
      const docWithMeta = { ...data, id: docId, createdAt: serverTimestamp() };
      await setDoc(noticeDocRef, docWithMeta);
    } else {
      await updateDoc(noticeDocRef, data);
    }
    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    return { success: true, message: `Notice successfully ${isNew ? 'created' : 'updated'}.` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteNotice(id: string) {
  if (!id) return { success: false, error: "Notice ID is required." };
  const noticeDocRef = doc(db, 'notices', id);
  try {
    await deleteDoc(noticeDocRef);
    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    return { success: true, message: "Notice deleted successfully." };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- Doubt Box Management ---

export async function createDoubt(userId: string, userName: string, userClassAndSection: string | undefined, question: string): Promise<{ success: boolean, error?: string }> {
    if (!userId || !question) {
        return { success: false, error: "User ID and question are required." };
    }
    const doubtId = uuidv4();
    const doubtDocRef = doc(db, "doubts", doubtId);

    const newDoubt: Omit<Doubt, 'id'| 'createdAt'> = {
        userId,
        userName,
        userClassAndSection,
        question,
        status: 'pending',
    };

    try {
        await setDoc(doubtDocRef, { ...newDoubt, createdAt: serverTimestamp() });
        revalidatePath('/doubt-box');
        revalidatePath('/admin/doubts');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getUserDoubts(userId: string): Promise<Doubt[]> {
    noStore();
    if (!userId) return [];
    
    const doubtsCollection = collection(db, 'doubts');
    const q = query(doubtsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
            } as Doubt;
        });
    } catch (error) {
        console.error("Error fetching user doubts:", error);
        return [];
    }
}

export async function getAllDoubts(): Promise<Doubt[]> {
    noStore();
    const doubtsCollection = collection(db, 'doubts');
    const q = query(doubtsCollection, orderBy('createdAt', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
                answeredAt: data.answeredAt?.toMillis ? data.answeredAt.toMillis() : data.answeredAt,
            } as Doubt;
        });
    } catch (error) {
        console.error("Error fetching all doubts:", error);
        return [];
    }
}

export async function answerDoubt(doubtId: string, answer: string, adminName: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    if (!doubtId || !answer || !adminName || !adminId) {
        return { success: false, error: "Missing required fields." };
    }
    const doubtDocRef = doc(db, 'doubts', doubtId);

    try {
        await runTransaction(db, async (transaction) => {
            const doubtDoc = await transaction.get(doubtDocRef);
            if (!doubtDoc.exists()) {
                throw new Error("Doubt not found.");
            }

            const dataToUpdate: { [key: string]: any } = {
                answer: answer,
                answeredBy: adminName,
                answeredByAdminId: adminId,
            };

            // Only update status and answeredAt if it's the first time being answered
            if (doubtDoc.data().status !== 'answered') {
                dataToUpdate.status = 'answered';
                dataToUpdate.answeredAt = serverTimestamp();
            }

            transaction.update(doubtDocRef, dataToUpdate);
        });

        revalidatePath('/admin/doubts');
        revalidatePath('/doubt-box');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteDoubt(doubtId: string): Promise<{ success: boolean; error?: string }> {
    if (!doubtId) {
        return { success: false, error: "Doubt ID is required." };
    }
    const doubtDocRef = doc(db, 'doubts', doubtId);
    try {
        await deleteDoc(doubtDocRef);
        revalidatePath('/admin/doubts');
        revalidatePath('/doubt-box');
        return { success: true, message: "Doubt deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- Complaint Box Management ---

export async function createComplaint(userId: string, userName: string, userClassAndSection: string | undefined, content: string): Promise<{ success: boolean, error?: string }> {
    if (!userId || !content) {
        return { success: false, error: "User ID and complaint content are required." };
    }
    const complaintId = uuidv4();
    const complaintDocRef = doc(db, "complaints", complaintId);

    const newComplaint: Omit<Complaint, 'id' | 'createdAt'> = {
        userId,
        userName,
        userClassAndSection,
        content,
        status: 'pending',
    };

    try {
        await setDoc(complaintDocRef, { ...newComplaint, createdAt: serverTimestamp() });
        revalidatePath('/complaints');
        revalidatePath('/admin/complaints');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getUserComplaints(userId: string): Promise<Complaint[]> {
    noStore();
    if (!userId) return [];
    
    const complaintsCollection = collection(db, 'complaints');
    const q = query(complaintsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
            } as Complaint;
        });
    } catch (error) {
        console.error("Error fetching user complaints:", error);
        return [];
    }
}

export async function getAllComplaints(): Promise<Complaint[]> {
    noStore();
    const complaintsCollection = collection(db, 'complaints');
    const q = query(complaintsCollection, orderBy('createdAt', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
                resolvedAt: data.resolvedAt?.toMillis ? data.resolvedAt.toMillis() : data.resolvedAt,
            } as Complaint;
        });
    } catch (error) {
        console.error("Error fetching all complaints:", error);
        return [];
    }
}

export async function resolveComplaint(complaintId: string, response: string, adminName: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    if (!complaintId || !response || !adminName || !adminId) {
        return { success: false, error: "Missing required fields." };
    }
    const complaintDocRef = doc(db, 'complaints', complaintId);

    try {
        await runTransaction(db, async (transaction) => {
            const complaintDoc = await transaction.get(complaintDocRef);
            if (!complaintDoc.exists()) {
                throw new Error("Complaint not found.");
            }

            const dataToUpdate: { [key: string]: any } = {
                response: response,
                resolvedBy: adminName,
                resolvedByAdminId: adminId,
            };

            if (complaintDoc.data().status !== 'resolved') {
                dataToUpdate.status = 'resolved';
                dataToUpdate.resolvedAt = serverTimestamp();
            }

            transaction.update(complaintDocRef, dataToUpdate);
        });

        revalidatePath('/admin/complaints');
        revalidatePath('/complaints');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteComplaint(complaintId: string): Promise<{ success: boolean; error?: string }> {
    if (!complaintId) {
        return { success: false, error: "Complaint ID is required." };
    }
    const complaintDocRef = doc(db, 'complaints', complaintId);
    try {
        await deleteDoc(complaintDocRef);
        revalidatePath('/admin/complaints');
        revalidatePath('/complaints');
        return { success: true, message: "Complaint deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- MCQ Management ---
export const upsertMCQSet = async (data: { id?: string; subjectId: string; subSubjectId: string; chapterId: string; name: string; mcqs: Omit<MCQ, 'id'>[] }) => {
    const { id, subjectId, subSubjectId, chapterId, name, mcqs } = data;
    const isNew = !id;
    const mcqSetId = isNew ? uuidv4() : id!;
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;

            const subSubject = subjectData.subSubjects?.find(ss => ss.id === subSubjectId);
            if (!subSubject) throw new Error("Sub-subject not found!");

            const chapter = subSubject.chapters?.find(c => c.id === chapterId);
            if (!chapter) throw new Error("Chapter not found!");

            if (!chapter.mcqSets) chapter.mcqSets = [];
            
            const mcqsWithIds = mcqs.map(mcq => ({ ...mcq, id: uuidv4() }));

            const newMCQSet: MCQSet = {
                id: mcqSetId,
                name: name,
                mcqs: mcqsWithIds,
            };

            const existingSetIndex = chapter.mcqSets.findIndex(set => set.id === mcqSetId);
            if (existingSetIndex > -1) {
                chapter.mcqSets[existingSetIndex] = newMCQSet;
            } else {
                chapter.mcqSets.push(newMCQSet);
            }

            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath('/admin/mcqs');
        revalidatePath('/mcqs');
        return { success: true, message: `MCQ Set successfully ${isNew ? 'created' : 'updated'}.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const deleteMCQSet = async (subjectId: string, subSubjectId: string, chapterId: string, mcqSetId: string) => {
    const subjectDocRef = doc(db, "subjects", subjectId);

    try {
        await runTransaction(db, async (transaction) => {
            const subjectDoc = await transaction.get(subjectDocRef);
            if (!subjectDoc.exists()) throw new Error("Subject not found!");
            const subjectData = subjectDoc.data() as Subject;

            const subSubject = subjectData.subSubjects?.find(ss => ss.id === subSubjectId);
            if (!subSubject) throw new Error("Sub-subject not found!");

            const chapter = subSubject.chapters?.find(c => c.id === chapterId);
            if (!chapter || !chapter.mcqSets) throw new Error("Chapter or MCQ sets not found!");

            chapter.mcqSets = chapter.mcqSets.filter(m => m.id !== mcqSetId);

            transaction.update(subjectDocRef, { subSubjects: subjectData.subSubjects });
        });

        revalidatePath('/admin/mcqs');
        revalidatePath('/mcqs');
        return { success: true, message: "MCQ set deleted successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};


export async function markQuizAsAttempted(userId: string, mcqSetId: string) {
    if (!userId || !mcqSetId) {
        return { success: false, error: "User ID and MCQ Set ID are required." };
    }
    const userDocRef = doc(db, "users", userId);
    try {
        await updateDoc(userDocRef, {
            attemptedQuizzes: arrayUnion(mcqSetId)
        });
        revalidatePath('/mcqs');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<{ success: boolean, error?: string, attemptId?: string }> {
    const attemptId = uuidv4();
    const attemptDocRef = doc(db, "quizAttempts", attemptId);

    const newAttempt: Omit<QuizAttempt, 'id'> = {
        ...attemptData,
    };

    try {
        await setDoc(attemptDocRef, { ...newAttempt, id: attemptId, createdAt: serverTimestamp() });
        return { success: true, attemptId: attemptId };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getQuizAttemptById(attemptId: string): Promise<QuizAttempt | null> {
    noStore();
    if (!attemptId) return null;
    const attemptDocRef = doc(db, 'quizAttempts', attemptId);
    try {
        const docSnap = await getDoc(attemptDocRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
             return {
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
             } as QuizAttempt;
        }
        return null;
    } catch (error) {
        console.error("Error fetching quiz attempt by ID:", error);
        return null;
    }
}

export async function getAllQuizAttempts(): Promise<QuizAttempt[]> {
    noStore();
    const attemptsCollection = collection(db, 'quizAttempts');
    const q = query(attemptsCollection, orderBy('createdAt', 'desc'));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
            } as QuizAttempt;
        });
    } catch (error) {
        console.error("Error fetching all quiz attempts:", error);
        return [];
    }
}


// --- Print Order Management ---
export async function createPrintOrder(orderData: Omit<PrintOrder, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; error?: string; orderId?: string; }> {
    const orderId = uuidv4();
    const orderDocRef = doc(db, "printOrders", orderId);

    const newOrder: Omit<PrintOrder, 'id' | 'createdAt'> = {
        ...orderData,
        status: 'pending',
    };

    try {
        await setDoc(orderDocRef, { ...newOrder, id: orderId, createdAt: serverTimestamp() });
        revalidatePath('/admin/orders');
        revalidatePath('/purchase-history');
        return { success: true, orderId: orderId };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getUserPrintOrders(userId: string): Promise<PrintOrder[]> {
    noStore();
    if (!userId) {
        return [];
    }

    try {
        const ordersCollection = collection(db, 'printOrders');
        const q = query(ordersCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
            } as PrintOrder;
        });

    } catch (error) {
        console.error("Error fetching user print orders:", error);
        return [];
    }
}

export async function getAllPrintOrders(): Promise<PrintOrder[]> {
    noStore();
    const ordersCollection = collection(db, 'printOrders');
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
            } as PrintOrder;
        });
    } catch (error) {
        console.error("Error fetching print orders:", error);
        return [];
    }
}

export async function getPrintOrderById(orderId: string): Promise<PrintOrder | null> {
    noStore();
    if (!orderId) return null;
    const orderDocRef = doc(db, 'printOrders', orderId);
    try {
        const docSnap = await getDoc(orderDocRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
             return {
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
             } as PrintOrder;
        }
        return null;
    } catch (error) {
        console.error("Error fetching print order by ID:", error);
        return null;
    }
}


export async function updatePrintOrderStatus(orderId: string, status: PrintOrder['status']): Promise<{ success: boolean; error?: string }> {
    if (!orderId || !status) {
        return { success: false, error: "Order ID and status are required." };
    }
    const orderDocRef = doc(db, 'printOrders', orderId);
    try {
        await updateDoc(orderDocRef, { status });
        revalidatePath('/admin/orders');
        revalidatePath('/purchase-history');
        return { success: true, message: "Order status updated." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- Settings Management ---
export async function getSettings(): Promise<AppSettings> {
    noStore();
    const settingsDocRef = doc(db, 'settings', 'global');
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as AppSettings;
        }
        // Return default settings if document doesn't exist
        return { printCostPerPage: 1 };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { printCostPerPage: 1 };
    }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> {
    const settingsDocRef = doc(db, 'settings', 'global');
    try {
        await setDoc(settingsDocRef, settings, { merge: true });
        revalidatePath('/admin/settings');
        revalidatePath('/order-print', 'layout');
        return { success: true, message: "Settings updated successfully." };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


// --- Subscription Management ---

export async function createSubscriptionRequest(
    data: Pick<Subscription, 'userId' | 'userName' | 'userEmail' | 'paymentMethod'>
): Promise<{ success: boolean, error?: string }> {
    const { userId, userName, userEmail, paymentMethod } = data;
    if (!userId || !userName || !userEmail || !paymentMethod) {
        return { success: false, error: "Missing required fields for subscription request." };
    }

    const subscriptionId = uuidv4();
    const subscriptionDocRef = doc(db, "subscriptions", subscriptionId);

    const newSubscription: Omit<Subscription, 'id' | 'createdAt'> = {
        userId,
        userName,
        userEmail,
        paymentMethod,
        status: 'pending',
    };

    try {
        await setDoc(subscriptionDocRef, { ...newSubscription, id: subscriptionId, createdAt: serverTimestamp() });
        revalidatePath('/admin/subscriptions');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


export async function getAllSubscriptions(): Promise<Subscription[]> {
    noStore();
    const subscriptionsCollection = collection(db, 'subscriptions');
    const q = query(subscriptionsCollection, orderBy('createdAt', 'desc'));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toMillis() || 0,
                completedAt: data.completedAt?.toMillis() || undefined,
            } as Subscription;
        });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return [];
    }
}

export async function completeSubscription(subscriptionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!subscriptionId || !userId) {
        return { success: false, error: "Subscription ID and User ID are required." };
    }

    const subscriptionDocRef = doc(db, 'subscriptions', subscriptionId);
    const userDocRef = doc(db, 'users', userId);

    const batch = writeBatch(db);

    // Update subscription status
    batch.update(subscriptionDocRef, {
        status: 'completed',
        completedAt: serverTimestamp()
    });

    // Update user's access rights
    batch.update(userDocRef, {
        hasFullNotesAccess: true,
        demoExpiresAt: null // Remove demo access if it exists
    });

    try {
        await batch.commit();
        revalidatePath('/admin/subscriptions');
        revalidatePath('/', 'layout'); // Revalidate layout to update auth context everywhere
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
