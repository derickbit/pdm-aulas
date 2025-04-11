import { firebaseConfig } from  "./firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Autentica no Firebase
export const app = initializeApp(firebaseConfig);
// Inicializa o módulo de autenticação
export const auth = getAuth(app);
export const firestore = getFirestore(app);
