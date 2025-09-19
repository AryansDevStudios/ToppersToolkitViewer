
"use client";

import { useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

const setSessionCookie = async (user: FirebaseUser | null) => {
    if (user) {
        try {
            const idToken = await user.getIdToken();
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
        } catch (error) {
            // This can fail if the server-side auth isn't set up, but client-side can still work.
            console.warn("Could not set session cookie. This is expected if not using server-side rendering with authentication.", error);
        }
    } else {
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
        } catch (error) {
            console.warn("Could not delete session cookie.", error);
        }
    }
};


export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userData = await getUserById(firebaseUser.uid);
          setDbUser(userData);
        } catch (error) {
          console.error("Auth Error fetching dbUser:", error);
          setDbUser(null);
        } finally {
          await setSessionCookie(firebaseUser);
          setLoading(false);
        }
      } else {
        setUser(null);
        setDbUser(null);
        await setSessionCookie(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const role = useMemo(() => dbUser?.role || null, [dbUser]);

  return { user, dbUser, role, loading };
}
