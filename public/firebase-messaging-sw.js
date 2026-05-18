importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAgwwMnfOpcNk8vPHpyENyqDQYcueW4Prc",
  authDomain: "library-daa2f.firebaseapp.com",
  projectId: "library-daa2f",
  storageBucket: "library-daa2f.firebasestorage.app",
  messagingSenderId: "5443472259",
  appId: "1:5443472259:web:c3c2800323dd1130cb44b6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'إشعار جديد من المكتبة';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico', // You can change this to a logo path
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
