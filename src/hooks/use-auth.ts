
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

export function useAuth(initialUser: User | null) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(initialUser);
  // The 'loading' state is true only until the initial check is done.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // If the dbUser is not already set or differs from the firebaseUser, fetch it.
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
        setUser(null);
        setDbUser(null);
        // Don't await this, let it happen in the background
        fetch('/api/auth/session', { method: 'DELETE' });
      }
      // Once the initial auth state is determined, we are no longer 'loading'.
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Run only once on mount
  
  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  // When `initialUser` prop changes (on server-side navigation), update our state.
  useEffect(() => {
      if (initialUser) {
          setDbUser(initialUser);
      }
  }, [initialUser]);


  return { user, dbUser, role, loading };
}
