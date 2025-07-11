import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBNA0wMhvED5DyNUfR40aroqaYI3pbglBs",
  authDomain: "createsco-829e7.firebaseapp.com",
  projectId: "createsco-829e7",
  storageBucket: "createsco-829e7.firebasestorage.app",
  messagingSenderId: "122724615208",
  appId: "1:122724615208:web:4094eb768e41005d10e11d",
  measurementId: "G-Q4DSHVKCB5"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)
export default app
