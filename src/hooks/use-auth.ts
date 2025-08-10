
"use client";

import { useEffect, useState } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getRedirectResult, db } from '@/lib/firebase';
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<User['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      setLoading(true);
      try {
        // First, check for redirect result
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // A user has just signed in or signed up via redirect.
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
      } catch (error) {
        console.error("Error processing redirect result:", error);
      }

      // Then, set up the state listener. This will also run after a redirect.
      const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
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

      return () => unsubscribe();
    };
    
    processAuth();
  }, []);

  return { user, role, loading };
}
