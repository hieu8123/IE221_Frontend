// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMZt7DtQI4DdSK3KsZ9M3ZlE1YOtUsXys",
  authDomain: "webbanhang-25296.firebaseapp.com",
  databaseURL: "https://webbanhang-25296-default-rtdb.firebaseio.com",
  projectId: "webbanhang-25296",
  storageBucket: "webbanhang-25296.appspot.com",
  messagingSenderId: "232680871274",
  appId: "1:232680871274:web:9d49808655082d67308113",
  measurementId: "G-Y9RPEMW39E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined" && isSupported()) {
  const analytics = getAnalytics(app);
}

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(app);

// Now you can use the 'storage' object to work with Firebase Storage
export { storage, ref, uploadBytes, getDownloadURL };
