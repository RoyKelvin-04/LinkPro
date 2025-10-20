import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCyxJuYE-i6MVIRJhDUKddoxIs0hPkDqPE",
    authDomain: "linkedin-clone-yt-655c7.firebaseapp.com",
    projectId: "linkedin-clone-yt-655c7",
    storageBucket: "linkedin-clone-yt-655c7.appspot.com",
    messagingSenderId: "460658869920",
    appId: "1:460658869920:web:b7aeb236ffa5c060fbebc5"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth};

