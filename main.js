import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVFMT5CbSg4q5G43WE6gPw4pWiEY4eBb0",
    authDomain: "studyquest-wad.firebaseapp.com",
    databaseURL: "https://studyquest-wad-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "studyquest-wad",
    storageBucket: "studyquest-wad.firebasestorage.app",
    messagingSenderId: "1040307115760",
    appId: "1:1040307115760:web:981571649b4756e2c69435",
    measurementId: "G-DBMS2Q6901"
};

const app = initializeApp(firebaseConfig);

window.studyQuestFirebase = {
    app,
    config: firebaseConfig
};

window.dispatchEvent(new CustomEvent('studyquest:firebase-ready', {
    detail: window.studyQuestFirebase
}));

export { app, firebaseConfig };
