
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

export function useAuth(initialUser: User | null) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser); // Only be in a loading state if there's no initialUser

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // If dbUser is not set or differs, fetch it.
        if (!dbUser || dbUser.id !== firebaseUser.uid) {
            const userData = await getUserById(firebaseUser.uid);
            setDbUser(userData);
        }
        // Sync session in the background
        firebaseUser.getIdToken().then(idToken => {
            fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${idToken}` },
            });
        });
      } else {
        setDbUser(null);
        fetch('/api/auth/session', { method: 'DELETE' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Only runs once on mount

  const role = useMemo(() => dbUser?.role || null, [dbUser]);
  
  // This effect ensures that on client-side navigation, the new
  // server-fetched `initialUser` is immediately reflected.
  useEffect(() => {
    if (initialUser) {
      setDbUser(initialUser);
    }
  }, [initialUser]);

  return { user, dbUser, role, loading };
}
