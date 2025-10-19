
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

// A simple in-memory cache for the user data
let dbUserCache: User | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useAuth(initialUser: User | null = null) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(dbUserCache || initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const now = Date.now();
        // Use cache if it's recent, otherwise re-fetch
        if (dbUserCache && now - lastFetchTimestamp < CACHE_DURATION && dbUserCache.id === firebaseUser.uid) {
            setDbUser(dbUserCache);
        } else {
            const userData = await getUserById(firebaseUser.uid);
            dbUserCache = userData;
            lastFetchTimestamp = now;
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
        // Clear user and cache on logout
        dbUserCache = null;
        lastFetchTimestamp = 0;
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  return { user, dbUser, role, loading };
}
