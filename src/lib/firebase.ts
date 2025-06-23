// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDrly6HpH97IJT_9a8t8GAm_8Od1Vpubg0",
    authDomain: "si-umkm-a4065.firebaseapp.com",
    projectId: "si-umkm-a4065",
    storageBucket: "si-umkm-a4065.firebasestorage.app",
    messagingSenderId: "896228192851",
    appId: "1:896228192851:web:b8149abe6fff2c11590ca6",
    measurementId: "G-3V9KQHFSQ4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);