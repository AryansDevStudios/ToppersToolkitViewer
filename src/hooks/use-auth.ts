
"use client";

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';

const setSessionCookie = async (user: FirebaseUser | null) => {
    if (user) {
        const idToken = await user.getIdToken();
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
    } else {
        await fetch('/api/auth/session', { method: 'DELETE' });
    }
};


export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [role, setRole] = useState<User['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await setSessionCookie(firebaseUser);
        // Fetch DB user data in the background
        getUserById(firebaseUser.uid).then(userData => {
          setDbUser(userData);
          setRole(userData?.role || 'User');
        });
      } else {
        setUser(null);
        setDbUser(null);
        setRole(null);
        await setSessionCookie(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, dbUser, role, loading };
}
