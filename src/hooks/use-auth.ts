
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // If dbUser is already populated from the server, we don't need to fetch it again
        if (dbUser && dbUser.id === firebaseUser.uid) {
            setLoading(false);
            return;
        }

        // Fetch dbUser only if it's not available or doesn't match
        try {
          const [userData, idToken] = await Promise.all([
            getUserById(firebaseUser.uid),
            firebaseUser.getIdToken()
          ]);
          
          setDbUser(userData);

          await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${idToken}`,
              },
          });

        } catch (error) {
          console.error("Auth Error:", error);
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
  }, [user, dbUser]);
  
  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  return { user, dbUser, role, loading };
}
