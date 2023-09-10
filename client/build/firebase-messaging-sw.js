importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAMf2IlwmTa52FbCI8trhzlpJ_JGOYX3Qk",
  authDomain: "chitchat-d494c.firebaseapp.com",
  projectId: "chitchat-d494c",
  storageBucket: "chitchat-d494c.appspot.com",
  messagingSenderId: "578156535718",
  appId: "1:578156535718:web:16104b6ce00f48cbf17967",
  measurementId: "G-97F2YVJFNR",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
