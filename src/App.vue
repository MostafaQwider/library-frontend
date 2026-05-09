<template>
  <div id="app">
    <router-view />
    <!-- Chatbot Button - Hidden on Login/Register -->
    <ChatbotUI v-if="!isAuthPage" />
  </div>
</template>

<script>
import ChatbotUI from '@/components/ChatbotUI.vue';

export default {
  components: {
    ChatbotUI
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
