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

    <!-- الجانب الأيسر - نموذج التسجيل -->
    <div class="right-panel">
      <div class="login-box">
        <div class="login-header">
          <div class="avatar-ring">
            <i class="fas fa-user-plus"></i>
          </div>
          <h2>إنشاء حساب جديد</h2>
          <p>انضم إلى مكتبتنا وابدأ رحلتك المعرفية</p>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">

          <div class="field-group" :class="{ 'has-error': fullNameError }">
            <label>الاسم الكامل</label>
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                type="text"
                v-model="fullName"
                placeholder="الاسم الثلاثي"
                @input="validateFullName"
                autocomplete="off"
              />
            </div>
            <transition name="err">
              <span v-if="fullNameError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ fullNameError }}</span>
            </transition>
          </div>

          <div class="field-group" :class="{ 'has-error': emailError }">
            <label>البريد الإلكتروني</label>
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

          <div class="field-group" :class="{ 'has-error': phoneError }">
            <label>رقم الهاتف</label>
            <div class="input-wrapper">
              <i class="fas fa-phone input-icon"></i>
              <input
                type="text"
                v-model="phone"
                placeholder="09..."
                @input="validatePhone"
                autocomplete="off"
              />
            </div>
            <transition name="err">
              <span v-if="phoneError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ phoneError }}</span>
            </transition>
          </div>

          <div class="field-group" :class="{ 'has-error': universityNumberError }">
            <label>الرقم الجامعي</label>
            <div class="input-wrapper">
              <i class="fas fa-id-card input-icon"></i>
              <input
                type="text"
                v-model="universityNumber"
                placeholder="رقمك الجامعي"
                @input="validateUniversityNumber"
                autocomplete="off"
              />
            </div>
            <transition name="err">
              <span v-if="universityNumberError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ universityNumberError }}</span>
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

          <div class="field-group" :class="{ 'has-error': confirmPasswordError }">
            <label>تأكيد كلمة المرور</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                :type="showConfirmPass ? 'text' : 'password'"
                v-model="confirmPassword"
                placeholder="••••••••"
                @input="validateConfirmPassword"
              />
              <button type="button" class="eye-btn" @click="showConfirmPass = !showConfirmPass">
                <i :class="!showConfirmPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <transition name="err">
              <span v-if="confirmPasswordError" class="err-msg"><i class="fas fa-exclamation-circle"></i> {{ confirmPasswordError }}</span>
            </transition>
          </div>

          <div class="form-options">
            <span></span>
            <router-link to="/login" class="forgot-link">لديك حساب بالفعل؟ تسجيل الدخول</router-link>
          </div>

          <button type="submit" :disabled="!isFormValid || isLoading" class="login-btn" :class="{ 'loading': isLoading }">
            <span v-if="!isLoading"><i class="fas fa-user-plus"></i> إنشاء حساب</span>
            <span v-else class="dots"><span></span><span></span><span></span></span>
          </button>

          <div v-if="apiError" class="api-error">
            <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
          </div>
        </form>

      </div>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '../../store/authStore'

export default {
  data() {
    return {
      fullName: '',
      email: '',
      phone: '',
      universityNumber: '',
      password: '',
      confirmPassword: '',
      
      fullNameError: '',
      emailError: '',
      phoneError: '',
      universityNumberError: '',
      passwordError: '',
      confirmPasswordError: '',
      apiError: '',
      
      showPass: false,
      showConfirmPass: false,
      isLoading: false,
    };
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
      return this.fullName.length >= 3 &&
             emailPattern.test(this.email) &&
             this.phone.length >= 10 &&
             this.universityNumber.length > 0 &&
             this.password.length >= 6 &&
             this.password === this.confirmPassword;
    }
  },
  methods: {
    validateFullName() {
      this.fullNameError = this.fullName.length < 3 ? 'يرجى إدخال اسم صحيح' : '';
    },
    validateEmail() {
      const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
      this.emailError = !emailPattern.test(this.email) ? 'يرجى إدخال بريد إلكتروني صحيح' : '';
    },
    validatePhone() {
      this.phoneError = this.phone.length < 10 ? 'يرجى إدخال رقم هاتف صحيح' : '';
    },
    validateUniversityNumber() {
      this.universityNumberError = this.universityNumber.length === 0 ? 'يرجى إدخال الرقم الجامعي' : '';
    },
    validatePassword() {
      if (this.password.length < 6) {
        this.passwordError = 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)';
      } else {
        this.passwordError = '';
      }
      this.validateConfirmPassword();
    },
    validateConfirmPassword() {
      if (this.confirmPassword !== this.password) {
        this.confirmPasswordError = 'كلمتا المرور غير متطابقتين';
      } else {
        this.confirmPasswordError = '';
      }
    },
    async handleRegister() {
      if (!this.isFormValid) return;
      this.isLoading = true;
      this.apiError = '';
      const authStore = useAuthStore();
      const result = await authStore.register({
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        universityNumber: this.universityNumber,
        password: this.password
      });
      this.isLoading = false;
      if (result.success) {
        this.$router.push('/login');
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
  overflow: hidden;
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
  margin-bottom: 25px;
}

.avatar-ring {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: white;
  margin: 0 auto 15px;
  box-shadow: 0 8px 25px rgba(46,134,193,0.35);
}

.login-header h2 {
  font-size: 1.5rem;
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
  margin-bottom: 15px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.85rem;
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
  padding: 10px 42px 10px 45px;
  border: 2px solid #e8ecf0;
  border-radius: 12px;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.9rem;
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
  font-size: 0.75rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

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
  padding: 12px;
  background: linear-gradient(135deg, #1a5276, #2e86c1);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
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
  .right-panel { flex: 1; background: white; padding-top: 20px; padding-bottom: 20px; }
  .login-wrapper { overflow-y: auto; }
}
</style>
