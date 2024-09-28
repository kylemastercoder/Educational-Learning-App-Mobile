// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyDV0xvCnA1oDsOJPUdN3f0MqlMArOcHrKU",
  authDomain: "educational-webapp.firebaseapp.com",
  projectId: "educational-webapp",
  storageBucket: "educational-webapp.appspot.com",
  messagingSenderId: "71257234212",
  appId: "1:71257234212:web:a38f218965a227825bb1b1",
  measurementId: "G-R6110L6MSD",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);
