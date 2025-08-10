
"use client";

import { useEffect, useState } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getRedirectResult, db } from '@/lib/firebase';
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<User['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userDocRef = doc(db, "users", user.uid);
          const userData = await getUserById(user.uid);
          if (!userData) {
            await setDoc(userDocRef, {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              role: 'User',
            });
          }
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };
    
    handleRedirectResult();

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
  }, []);

  return { user, role, loading };
}
