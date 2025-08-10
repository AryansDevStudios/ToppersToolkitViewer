
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration for topperstoolkit-63d3a
const firebaseConfig = {
  apiKey: "AIzaSyAf9uNN6tI1MxAIeFQzVTotFZicVG1m4k8",
  authDomain: "topperstoolkit-63d3a.firebaseapp.com",
  projectId: "topperstoolkit-63d3a",
  storageBucket: "topperstoolkit-63d3a.appspot.com",
  messagingSenderId: "979936342565",
  appId: "1:979936342565:web:52517f920d42c8bada05cc",
  measurementId: "G-4MR8EHPVJW"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Function to handle user creation in Firestore after Google Sign-In
export const handleGoogleSignInUser = async (user: any) => {
    if (!user || !user.uid || !user.email) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "Google User",
        role: "User",
        provider: "google",
      });
    }
};


export { app, auth, db, storage, googleProvider, onAuthStateChanged, signInWithPopup, signInWithCredential, GoogleAuthProvider, signInWithEmailAndPassword };
