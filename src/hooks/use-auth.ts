
"use client";

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, getRedirectResult, db, onAuthStateChanged } from '@/lib/firebase';
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<User['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on component mount
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          // User signed in via redirect.
          const firebaseUrl = result.user;
          const userDocRef = doc(db, "users", firebaseUrl.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            // This is a new user, create their document
            await setDoc(userDocRef, {
              uid: firebaseUrl.uid,
              name: firebaseUrl.displayName,
              email: firebaseUrl.email,
              role: 'User',
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userData = await getUserById(firebaseUser.uid);
        setRole(userData?.role || 'User');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, role, loading };
}
