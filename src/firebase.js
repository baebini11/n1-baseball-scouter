import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (Singleton pattern with global cache for HMR)
let app;
let auth;
let db;
let googleProvider;

if (typeof window !== "undefined" && window._firebaseApp) {
    app = window._firebaseApp;
    auth = window._firebaseAuth;
    db = window._firebaseDb;
    googleProvider = window._firebaseGoogleProvider;
} else {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);

    // Initialize Firestore with settings to avoid "settingsFrozen" error
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
    } catch (e) {
        // If already initialized, just get the instance
        db = getFirestore(app);
    }

    googleProvider = new GoogleAuthProvider();

    if (typeof window !== "undefined") {
        window._firebaseApp = app;
        window._firebaseAuth = auth;
        window._firebaseDb = db;
        window._firebaseGoogleProvider = googleProvider;
    }
}

export { app, auth, db, googleProvider };
