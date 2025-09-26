
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Logic to create session cookie
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        try {
          const userData = await getUserById(firebaseUser.uid);
          setDbUser(userData);
        } catch (error) {
          console.error("Auth Error fetching dbUser:", error);
          setDbUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setDbUser(null);
        // Logic to clear session cookie
        await fetch('/api/auth/session', {
            method: 'DELETE',
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  return { user, dbUser, role, loading };
}
