
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app;

// This check is important to prevent re-initialization in a serverless environment
// and to avoid crashing when the service account key is not present.
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (!getApps().length) {
            app = initializeApp({
                credential: cert(serviceAccount),
            });
        } else {
            app = getApp();
        }
    } catch (e) {
        // Silently fail if key is invalid
        app = null;
    }
}


const auth = app ? getAuth(app) : null;

export { auth };
