import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAMf2IlwmTa52FbCI8trhzlpJ_JGOYX3Qk",
  authDomain: "chitchat-d494c.firebaseapp.com",
  projectId: "chitchat-d494c",
  storageBucket: "chitchat-d494c.appspot.com",
  messagingSenderId: "578156535718",
  appId: "1:578156535718:web:16104b6ce00f48cbf17967",
  measurementId: "G-97F2YVJFNR",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { app,  messaging };
