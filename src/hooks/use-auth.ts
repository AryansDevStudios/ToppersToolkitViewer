
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

export function useAuth(initialUser: User | null) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have an initial user from the server, we can consider the user loaded.
    if (initialUser) {
      setDbUser(initialUser);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Only fetch dbUser if it wasn't provided by the server initially
        if (!initialUser) {
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
        setUser(null);
        setDbUser(null);
        fetch('/api/auth/session', { method: 'DELETE' });
      }
      // Once the initial check is done, stop the main loading state.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialUser]);
  
  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  return { user, dbUser, role, loading };
}
