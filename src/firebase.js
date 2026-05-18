import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAgwwMnfOpcNk8vPHpyENyqDQYcueW4Prc",
  authDomain: "library-daa2f.firebaseapp.com",
  projectId: "library-daa2f",
  storageBucket: "library-daa2f.firebasestorage.app",
  messagingSenderId: "5443472259",
  appId: "1:5443472259:web:c3c2800323dd1130cb44b6",
  measurementId: "G-FF2CGNYBL0"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { 
        vapidKey: "BFMjdbAPnVj-zc8U63_is5NJ7GtUg97XQio9UY7A8yYDID6yh3D7Yf4hA0byjB_YJvMnrihcurbr0-FbLYdTcB4" 
      });
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
