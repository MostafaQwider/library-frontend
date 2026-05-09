<template>
  <div class="login-wrapper" dir="rtl">

    <!-- الجانب الأيمن - الصورة والمعلومات -->
    <div class="left-panel">
      <div class="panel-overlay"></div>
      <div class="panel-content">
        <div class="panel-logo">
          <i class="fas fa-university"></i>
        </div>
        <h1 class="panel-title">مكتبة جامعة قاسيون</h1>
        <p class="panel-subtitle">بوابتك نحو المعرفة والبحث العلمي</p>
        <div class="panel-stats">
          <div class="stat"><span class="num">Grow</span><span class="lbl"></span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="num">Read</span><span class="lbl"></span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="num">Borrow</span><span class="lbl"></span></div>
        </div>
      </div>
      <div class="floating-books">
        <div class="book-float b1"><i class="fas fa-book"></i></div>
        <div class="book-float b2"><i class="fas fa-book-open"></i></div>
        <div class="book-float b3"><i class="fas fa-graduation-cap"></i></div>
      </div>
    </div>

    <!-- الجانب الأيسر - نموذج الدخول -->
    <div class="right-panel">
      <div class="login-box">
        <div class="login-header">
          <div class="avatar-ring">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h2>المعرفة تبدأ بصفحة</h2>
          <p>سجّل دخولك للوصول إلى مكتبتك</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">

          <div class="field-group" :class="{ 'has-error': emailError }">
            <label>البريد الإلكتروني الجامعي</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope input-icon"></i>
              <input
                type="email"
                v-model="email"
                placeholder="example@univ.edu.sy"
                @input="validateEmail"
                autocomplete="off"
              />
            </div>
            <transition name="err">
              <span v-if="emailError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ emailError }}</span>
            </transition>
          </div>

          <div class="field-group" :class="{ 'has-error': passwordError }">
            <label>كلمة المرور</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                :type="showPass ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                @input="validatePassword"
              />
              <button type="button" class="eye-btn" @click="showPass = !showPass">
                <i :class="!showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <transition name="err">
              <span v-if="passwordError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ passwordError }}</span>
            </transition>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>تذكرني</span>
            </label>
            <router-link to="/register" class="forgot-link">إنشاء حساب بدلاً من ذلك</router-link>
          </div>

          <button type="submit" :disabled="!isFormValid || isLoading" class="login-btn" :class="{ 'loading': isLoading }">
            <span v-if="!isLoading"><i class="fas fa-sign-in-alt"></i> دخول للمكتبة</span>
            <span v-else class="dots"><span></span><span></span><span></span></span>
          </button>

          <div v-if="apiError" class="api-error">
            <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
          </div>

        </form>

        <div class="divider"><span>أو</span></div>
        <a href="#" class="support-link"><i class="fas fa-headset"></i> تواصل مع الدعم التقني</a>
      </div>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '../../store/authStore'

export default {
  data() {
    return {
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      apiError: '',
      showPass: false,
      rememberMe: false,
      isLoading: false,
    };
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
      return emailPattern.test(this.email) && this.password.length >= 6;
    }
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
      this.emailError = !emailPattern.test(this.email) ? 'يرجى إدخال بريد إلكتروني صحيح' : '';
    },
    validatePassword() {
      if (this.password.length < 6) {
        this.passwordError = 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)';
      } else {
        this.passwordError = '';
      }
    },
    async handleLogin() {
      if (!this.isFormValid) return;
      this.isLoading = true;
      this.apiError = '';
      const authStore = useAuthStore();
      const result = await authStore.login(this.email, this.password);
      this.isLoading = false;
      if (result.success) {
        if (authStore.isAdmin) {
          this.$router.push('/dashboard');
        } else {
          this.$router.push('/search');
        }
      } else {
        this.apiError = result.message;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-wrapper {
  display: flex;
  height: 100vh;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
  overflow: hidden;
}

/* ===== LEFT PANEL ===== */
.left-panel {
  flex: 1.1;
  background: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&fit=crop') center/cover no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.panel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(15,32,65,0.92) 0%, rgba(26,82,130,0.85) 100%);
}

.panel-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 40px;
}

.panel-logo {
  width: 90px;
  height: 90px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  margin: 0 auto 25px;
  backdrop-filter: blur(10px);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
}

.panel-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.panel-subtitle {
  font-size: 1rem;
  opacity: 0.75;
  margin-bottom: 50px;
  font-weight: 300;
}

.panel-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 20px 35px;
  backdrop-filter: blur(10px);
}

.stat { text-align: center; }
.num { display: block; font-size: 1.4rem; font-weight: 800; color: #5dade2; }
.lbl { display: block; font-size: 0.75rem; opacity: 0.7; margin-top: 3px; }
.stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

/* كتب طائرة */
.floating-books { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.book-float {
  position: absolute;
  color: rgba(255,255,255,0.06);
  font-size: 5rem;
  animation: floatAnim 8s ease-in-out infinite;
}
.b1 { top: 10%; right: 10%; animation-delay: 0s; font-size: 4rem; }
.b2 { bottom: 20%; left: 8%; animation-delay: 2.5s; font-size: 6rem; }
.b3 { top: 50%; right: 5%; animation-delay: 5s; font-size: 3.5rem; }

@keyframes floatAnim {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-25px) rotate(8deg); }
}

/* ===== RIGHT PANEL ===== */
.right-panel {
  flex: 0.9;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 30px;
  overflow-y: auto;
}

.login-box {
  width: 100%;
  max-width: 420px;
  margin: auto;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.avatar-ring {
  width: 75px;
  height: 75px;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  margin: 0 auto 18px;
  box-shadow: 0 8px 25px rgba(46,134,193,0.35);
}

.login-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a2940;
  margin-bottom: 6px;
}

.login-header p {
  color: #95a5a6;
  font-size: 0.9rem;
}

/* ===== FORM ===== */
.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: 15px;
  color: #aab7c4;
  font-size: 0.9rem;
  z-index: 1;
}

.input-wrapper input {
  width: 100%;
  padding: 13px 42px 13px 45px;
  border: 2px solid #e8ecf0;
  border-radius: 12px;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.95rem;
  background: white;
  transition: 0.25s;
  color: #2c3e50;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #2e86c1;
  box-shadow: 0 0 0 4px rgba(46,134,193,0.1);
}

.has-error .input-wrapper input { border-color: #e74c3c; }

.eye-btn {
  position: absolute;
  left: 14px;
  background: none;
  border: none;
  color: #aab7c4;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  transition: 0.2s;
}
.eye-btn:hover { color: #2e86c1; }

.err-msg {
  display: block;
  color: #e74c3c;
  font-size: 0.78rem;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.88rem;
  color: #7f8c8d;
  cursor: pointer;
}

.remember-me input { accent-color: #2e86c1; }

.forgot-link {
  font-size: 0.88rem;
  color: #2e86c1;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover { text-decoration: underline; }

/* زر الدخول */
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: 'Tajawal', sans-serif;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(46,134,193,0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(46,134,193,0.4);
}

.login-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* نقاط التحميل */
.dots { display: flex; gap: 5px; align-items: center; }
.dots span {
  width: 7px; height: 7px;
  background: white;
  border-radius: 50%;
  animation: dotBounce 1.2s infinite ease-in-out;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.divider {
  text-align: center;
  margin: 22px 0 15px;
  position: relative;
  color: #bdc3c7;
  font-size: 0.85rem;
}
.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: #e8ecf0;
}
.divider::before { right: 0; }
.divider::after { left: 0; }

.support-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #7f8c8d;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 11px;
  border: 2px solid #e8ecf0;
  border-radius: 12px;
  transition: 0.2s;
  font-weight: 500;
}
.support-link:hover { border-color: #2e86c1; color: #2e86c1; background: #f0f8ff; }

.api-error {
  background: #fdf0f0;
  color: #e74c3c;
  padding: 12px;
  border-radius: 10px;
  margin-top: 15px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fadbd8;
}

/* أنيميشن الخطأ */
.err-enter-active, .err-leave-active { transition: all 0.3s ease; }
.err-enter, .err-leave-to { opacity: 0; transform: translateY(-5px); }

/* Responsive */
@media (max-width: 768px) {
  .left-panel { display: none; }
  .right-panel { flex: 1; background: white; }
}
</style>
