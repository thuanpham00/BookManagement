import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDyF9ol4Ng1Cmp5nmExWKdprbVUiuGUFjY",
  authDomain: "readify-app-959fe.firebaseapp.com",
  projectId: "readify-app-959fe",
  storageBucket: "readify-app-959fe.firebasestorage.app",
  messagingSenderId: "818179822898",
  appId: "1:818179822898:web:43b923a617e4dfccc2f32b",
  measurementId: "G-3L8C8M986V"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig) // khởi tạo firebase

export const auth = getAuth()
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
