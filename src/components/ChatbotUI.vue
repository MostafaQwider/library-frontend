<template>
  <div class="chatbot-wrapper" dir="rtl">

    <!-- زر التبديل -->
    <transition name="toggle-pop">
      <button type="button" v-if="!isOpen" class="chat-toggle" @click="isOpen = true">
        <div class="toggle-inner">
          <i class="fas fa-comments"></i>
          <span>مساعد مكتبة قاسيون</span>
        </div>
        <span class="pulse-ring"></span>
      </button>
    </transition>

    <!-- نافذة الدردشة -->
    <transition name="chat-pop">
      <div v-if="isOpen" class="chat-window">

        <!-- Header -->
        <div class="chat-header">
          <div class="bot-avatar">
            <i class="fas fa-robot"></i>
            <span class="online-dot"></span>
          </div>
          <div class="bot-info">
            <h4>المساعد الذكي</h4>
            <span class="online-label"><i class="fas fa-circle"></i> متصل الآن</span>
          </div>
          <button type="button" class="close-btn" @click="isOpen = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" v-if="messages.length <= 1">
          <p class="quick-label">اختر سؤالاً سريعاً:</p>
          <div class="quick-btns">
            <button
              type="button"
              v-for="q in quickQuestions"
              :key="q"
              class="quick-btn"
              @click="sendQuick(q)"
            >{{ q }}</button>
          </div>
        </div>

        <!-- Knowledge Base -->
        <div class="faq-kb" v-if="faqKb.length">
          <div class="faq-kb-header">
            <h5>قاعدة المعرفة</h5>
            <p>يمكنك اختيار أحد الأسئلة الشائعة أو كتابة سؤالك مباشرة.</p>
          </div>
          <div class="faq-kb-list">
            <button
              type="button"
              v-for="faq in faqKb"
              :key="faq.id || faq.question"
              class="faq-card"
              @click="sendQuick(faq.question)"
            >
              <div class="faq-question">{{ faq.question }}</div>
              <div class="faq-answer">{{ faq.answer }}</div>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="msgBox">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['msg-row', msg.sender === 'bot' ? 'row-bot' : 'row-user']"
          >
            <div v-if="msg.sender === 'bot'" class="mini-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div :class="['bubble', msg.sender === 'bot' ? 'bubble-bot' : 'bubble-user']">
              {{ msg.text }}
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="msg-row row-bot">
            <div class="mini-avatar"><i class="fas fa-robot"></i></div>
            <div class="bubble bubble-bot typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <input
            v-model="userQuery"
            @keyup.enter="sendMessage"
            placeholder="اكتب سؤالك هنا..."
            class="chat-input"
            ref="inputField"
          />
          <button type="button" class="send-btn" @click="sendMessage" :disabled="!userQuery.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>

      </div>
    </transition>
  </div>
</template>

<script>
import { faqService } from '@/api/faqService';

export default {
  data() {
    return {
      isOpen: false,
      userQuery: '',
      isTyping: false,
      faqs: [],
      quickQuestions: [],
      messages: [
        { text: 'أهلاً بك في مكتبة جامعة قاسيون! كيف يمكنني مساعدتك اليوم؟', sender: 'bot', time: this.now() }
      ]
    };
  },
  async mounted() {
    try {
      const { data } = await faqService.getAll();
      this.faqs = Array.isArray(data) ? data : [];
      if (this.faqs && this.faqs.length > 0) {
        this.quickQuestions = this.faqs.slice(0, 4).map(f => f.question);
      } else {
        this.quickQuestions = ['كم مدة الاستعارة؟', 'ما هي الغرامة؟', 'كيف أحجز كتاباً؟'];
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      this.faqs = [];
      this.quickQuestions = ['كم مدة الاستعارة؟', 'ما هي الغرامة؟', 'كيف أحجز كتاباً؟'];
    }
  },
  computed: {
    faqKb() {
      if (!Array.isArray(this.faqs)) return [];
      const explicitKb = this.faqs.filter(f => f.faq_kb === true || f.isKnowledgeBase === true);
      return explicitKb.length ? explicitKb : this.faqs.slice(0, 5);
    }
  },
  methods: {
    now() {
      return new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
    },
    sendQuick(q) {
      this.userQuery = q;
      this.sendMessage();
    },
    sendMessage() {
      const text = this.userQuery.trim();
      if (!text) return;
      this.messages.push({ text, sender: 'user', time: this.now() });
      this.userQuery = '';
      this.isTyping = true;
      this.scroll();

      setTimeout(() => {
        const q = text.toLowerCase();
        
        // Search in fetched FAQs
        const found = Array.isArray(this.faqs) ? this.faqs.find(f => 
          f.question.toLowerCase().includes(q) || 
          q.includes(f.question.toLowerCase())
        ) : null;

        let res = '';
        if (found) {
          res = found.answer;
        } else {
          // Fallback logic
          res = 'نعتذر، لم أفهم سؤالك تماماً. هل تقصد الاستفسار عن المواعيد، الغرامات، أو طريقة الحجز؟';
          if (q.includes('مدة') || q.includes('استعارة')) res = 'تسمح المكتبة باستعارة الكتاب لمدة 14 يوماً قابلة للتجديد مرة واحدة عبر الموقع.';
          else if (q.includes('غرامة') || q.includes('تأخير')) res = 'غرامة التأخير هي 100 ل.س عن كل يوم تأخير، يرجى الالتزام بالمواعيد.';
          else if (q.includes('حجز') || q.includes('كيف')) res = 'يمكنك حجز الكتاب من صفحة البحث، ابحث عن الكتاب ثم اضغط "احجز الآن".';
          else if (q.includes('تأمين') || q.includes('500')) res = 'يجب شحن رصيدك بمبلغ 500 ل.س كأمانات لفتح ميزة الاستعارة الخارجية.';
        }

        this.messages.push({ text: res, sender: 'bot', time: this.now() });
        this.isTyping = false;
        this.scroll();
      }, 1400);
    },
    scroll() {
      this.$nextTick(() => {
        const el = this.$refs.msgBox;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');

* { box-sizing: border-box; }

.chatbot-wrapper {
  position: fixed;
  bottom: 28px;
  left: 28px;
  z-index: 9999;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
}

/* زر التبديل */
.chat-toggle {
  position: relative;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  color: white;
  border: none;
  padding: 13px 22px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(46,134,193,0.4);
  transition: 0.3s;
  overflow: visible;
}

.toggle-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Tajawal', sans-serif;
  position: relative;
  z-index: 1;
}

.chat-toggle:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(46,134,193,0.5); }

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50px;
  border: 2px solid rgba(46,134,193,0.4);
  animation: pulseRing 2s ease-out infinite;
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.15); opacity: 0; }
}

/* نافذة الدردشة */
.chat-window {
  width: 360px;
  height: 520px;
  background: white;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #1a3a5c, #1a5276);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  left: 1px;
  width: 11px;
  height: 11px;
  background: #2ecc71;
  border: 2px solid #1a3a5c;
  border-radius: 50%;
  animation: blink 2s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.bot-info { flex: 1; }
.bot-info h4 { color: white; font-size: 0.95rem; font-weight: 700; margin: 0 0 2px; }
.online-label { color: #2ecc71; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; }
.online-label i { font-size: 0.5rem; }

.close-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: rgba(255,255,255,0.7);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: rgba(231,76,60,0.5); color: white; }

/* Quick Actions */
.quick-actions {
  padding: 12px 15px;
  background: #f8fafc;
  border-bottom: 1px solid #edf0f3;
}
.quick-label { font-size: 0.75rem; color: #95a5a6; margin-bottom: 8px; }
.quick-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.quick-btn {
  padding: 5px 12px;
  background: white;
  border: 1px solid #d6e4f0;
  border-radius: 20px;
  color: #2e86c1;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}
.quick-btn:hover { background: #2e86c1; color: white; border-color: #2e86c1; }

.faq-kb {
  padding: 14px 15px 8px;
  background: #f8fafc;
  border-bottom: 1px solid #edf0f3;
}
.faq-kb-header {
  margin-bottom: 10px;
}
.faq-kb-header h5 {
  margin: 0 0 4px;
  font-size: 0.92rem;
  color: #1a3a5c;
}
.faq-kb-header p {
  margin: 0;
  font-size: 0.78rem;
  color: #6c7a89;
}
.faq-kb-list {
  display: grid;
  gap: 8px;
}
.faq-card {
  text-align: right;
  background: white;
  border: 1px solid #e6eef8;
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: grid;
  gap: 6px;
}
.faq-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(46, 134, 193, 0.12);
}
.faq-question {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a3a5c;
}
.faq-answer {
  font-size: 0.78rem;
  color: #5d6d7e;
  line-height: 1.4;
  max-height: 3.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Messages */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.msg-row { display: flex; align-items: flex-end; gap: 8px; }
.row-bot { justify-content: flex-start; }
.row-user { justify-content: flex-end; }

.mini-avatar {
  width: 30px;
  height: 30px;
  background: #1a5276;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.bubble {
  max-width: 78%;
  padding: 10px 14px;
  font-size: 0.88rem;
  line-height: 1.55;
  border-radius: 16px;
  position: relative;
}

.bubble-bot {
  background: white;
  color: #2c3e50;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.bubble-user {
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  color: white;
  border-bottom-left-radius: 4px;
  text-align: right;
}

.msg-time {
  display: block;
  font-size: 0.62rem;
  margin-top: 4px;
  opacity: 0.55;
}

/* Typing */
.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}
.typing span {
  width: 7px; height: 7px;
  background: #bdc3c7;
  border-radius: 50%;
  animation: typingBounce 1.3s infinite ease-in-out;
}
.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}

/* Input Area */
.chat-input-area {
  padding: 12px 15px;
  background: white;
  display: flex;
  gap: 8px;
  border-top: 1px solid #edf0f3;
}

.chat-input {
  flex: 1;
  border: 2px solid #edf0f3;
  padding: 10px 14px;
  border-radius: 12px;
  outline: none;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.9rem;
  color: #2c3e50;
  background: #f8fafc;
  transition: 0.2s;
}
.chat-input:focus { border-color: #2e86c1; background: white; }

.send-btn {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 12px rgba(46,134,193,0.35); }
.send-btn:disabled { background: #d5dbdb; cursor: not-allowed; }

/* Animations */
.chat-pop-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-pop-leave-active { transition: all 0.25s ease; }
.chat-pop-enter, .chat-pop-leave-to { opacity: 0; transform: translateY(20px) scale(0.92); }

.toggle-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toggle-pop-leave-active { transition: all 0.2s ease; }
.toggle-pop-enter, .toggle-pop-leave-to { opacity: 0; transform: scale(0.8); }

/* Scrollbar */
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #d5dbdb; border-radius: 4px; }
</style>
