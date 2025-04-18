import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Autentica no Firebase
export const app = initializeApp(firebaseConfig);
// Incializa o módulo de autenticação
export const auth = getAuth(app);

export const firestore = getFirestore(app);

export const storage = getStorage(app);

export default firestore;