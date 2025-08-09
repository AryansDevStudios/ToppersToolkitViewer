// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

function initializeAdmin() {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
        console.log('Firebase Admin SDK initialized successfully.');
        return admin.app();
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            console.error('Firebase Admin SDK initialization error: Invalid credentials. Check your service account key.', error.stack);
        } else if (error.code === 'app/duplicate-app') {
             // This is expected in development with hot-reloading
            return admin.app();
        }
        else {
            console.error("Firebase Admin SDK initialization error:", error.stack);
        }
    }
    return admin.app();
}

const app = admin.apps.length ? admin.app() : initializeAdmin();

const adminDb = admin.firestore();
const adminAuth = admin.auth();


export { adminAuth, adminDb };
