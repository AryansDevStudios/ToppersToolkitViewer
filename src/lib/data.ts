'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book } from "lucide-react";

import { db } from './firebase';
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

// You should create a 'subjects' collection in your Firestore and upload the data from `subjects-seed.json`
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsCollection = collection(db, 'subjects');
    const querySnapshot = await getDocs(subjectsCollection);
    if (querySnapshot.empty) {
      console.log('No subjects found in Firestore. Make sure to seed the data.');
      return [];
    }
    const subjects = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        icon: iconMap[data.icon as string] || Book, // Fallback icon
      } as Subject;
    });
    // A simple sort order
    const sorter = ['science', 'social-science', 'mathematics', 'english'];
    subjects.sort((a, b) => sorter.indexOf(a.id) - sorter.indexOf(b.id));

    return subjects;
  } catch (error) {
    console.error("Error fetching subjects: ", error);
    return [];
  }
};


export const getUsers = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
};

export const findItemBySlug = async (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };

  try {
    const subjectId = slug[0];
    const subjectDocRef = doc(db, 'subjects', subjectId);
    const subjectDoc = await getDoc(subjectDocRef);

    if (!subjectDoc.exists()) {
      return { current: null, parents: [] };
    }

    const subjectData = {
        ...subjectDoc.data(),
        id: subjectDoc.id,
        icon: iconMap[subjectDoc.data().icon as string] || Book
    } as Subject;

    let currentItem: any = subjectData;
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

  } catch (error) {
    console.error("Error finding item by slug: ", error);
    return { current: null, parents: [] };
  }
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
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().role || 'User';
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role: ", error);
    return null;
  }
};