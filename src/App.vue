<template>
  <div id="app">
    <router-view />
    <!-- Chatbot Button - Hidden on Login/Register -->
    <ChatbotUI v-if="!isAuthPage" />
  </div>
</template>

<script>
import ChatbotUI from '@/components/ChatbotUI.vue';
import { requestFirebaseNotificationPermission, onMessageListener } from '@/firebase';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/authService';
import { watch, onMounted } from 'vue';

export default {
  components: {
    ChatbotUI
  },
  setup() {
    const authStore = useAuthStore();

    const setupFirebaseMessaging = async () => {
      if (authStore.isAuthenticated) {
        const token = await requestFirebaseNotificationPermission();
        if (token) {
          try {
            await authService.saveFcmToken(token, 'WEB');
            console.log('FCM token saved successfully.');
          } catch (error) {
            console.error('Failed to save FCM token:', error);
          }
        }

        onMessageListener().then((payload) => {
          console.log('Foreground message received:', payload);
          // Show a simple alert or use a toast library if available
          const title = payload.notification?.title || 'إشعار جديد';
          const body = payload.notification?.body || '';
          alert(`${title}\n${body}`);
          
          // Re-register listener for the next message
          setupFirebaseMessaging();
        }).catch((err) => console.log('failed to listen: ', err));
      }
    };

    onMounted(() => {
      setupFirebaseMessaging();
    });

    watch(() => authStore.isAuthenticated, (newVal) => {
      if (newVal) {
        setupFirebaseMessaging();
      }
    });

    return {};
  },
  computed: {
    isAuthPage() {
      return this.$route.meta?.guest === true;
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Tajawal', sans-serif;
  background-color: #f0f2f5;
  direction: rtl;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f0f2f5; }
::-webkit-scrollbar-thumb { background: #bdc3c7; border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: #95a5a6; }
</style>
