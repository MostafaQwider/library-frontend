<template>
  <div class="profile-page-wrapper" dir="rtl">
    <div class="profile-card">
      <div class="profile-header">
        <button class="logout-btn" @click="logout"><i class="fas fa-camera"></i></button>
        <div class="profile-cover"></div>
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <i class="fas fa-user-graduate"></i>
            <button class="edit-avatar-btn"><i class="fas fa-camera"></i></button>
          </div>
          <h2>{{ user.full_name }}</h2>
          <span class="user-role">{{ roleLabel }} - {{ isStudent ? user.university_number : user.university_number }}</span>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-grid">
          
          <div class="info-section">
            <h4 class="section-title"><i class="fas fa-id-card"></i> البيانات الأساسية</h4>
            <div class="input-wrapper">
              <label>الاسم الكامل</label>
              <div class="input-with-icon">
                <i class="fas fa-user"></i>
                <input type="text" v-model="user.full_name" placeholder="أدخل اسمك الكامل" />
              </div>
            </div>

            <!-- الرقم الجامعي: فقط للطالب -->
            <div v-if="isStudent" class="input-wrapper">
              <label>الرقم الجامعي</label>
              <div class="input-with-icon disabled">
                <i class="fas fa-id-badge"></i>
                <input type="text" v-model="user.university_number" disabled />
              </div>
              <small class="hint-text">رقمك الجامعي الفريد</small>
            </div>

            <!-- رقم الهوية: للموظف/الدكتور -->
            <div v-if="!isStudent" class="input-wrapper">
              <label>رقم الهوية</label>
              <div class="input-with-icon disabled staff-id">
                <i class="fas fa-hashtag"></i>
                <input type="text" :value="user.university_number" disabled />
              </div>
              <small class="hint-text">رقم هويتك الوظيفي</small>
            </div>

            <div class="input-wrapper">
              <label>البريد الإلكتروني الجامعي</label>
              <div class="input-with-icon disabled">
                <i class="fas fa-envelope"></i>
                <input type="email" v-model="user.email" disabled />
              </div>
              <small class="hint-text">لا يمكن تغيير البريد الرسمي للمؤسسة</small>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title"><i class="fas fa-shield-alt"></i> الأمان والمالية</h4>
            <div class="input-wrapper">
              <label>تغيير كلمة المرور</label>
              <div class="input-with-icon">
                <i class="fas fa-key"></i>
                <input type="password" v-model="user.newPassword" placeholder="اتركه فارغاً للحفاظ على القديمة" />
              </div>
            </div>

            <div class="insurance-box" :class="{ 'paid': depositIsPaid }">
              <div class="insurance-info">
                <span class="label">حالة الإيداع</span>
                <p v-if="user.deposit" class="deposit-amount">
                  <strong>{{ user.deposit.currency }} {{ user.deposit.amount }}</strong>
                </p>
                <p v-if="depositIsPaid" class="status-msg">
                  <i class="fas fa-check-circle"></i> {{ depositStatusLabel }}
                </p>
                <p v-else class="status-msg unpaid">
                  <i class="fas fa-exclamation-triangle"></i> {{ depositStatusLabel }}
                </p>
              </div>
              <div v-if="depositIsPaid" class="verified-icon"><i class="fas fa-shield-check"></i></div>
            </div>
          </div>

        </div>

        <div class="profile-footer">
          <button @click="saveChanges" class="save-changes-btn" :disabled="saving">
            <i class="fas fa-save"></i> {{ saving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
          </button>
          <button class="cancel-btn" @click="$router.back()">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { userService } from '../../api/userService'

const DEPOSIT_STATUS_LABELS = {
  NOT_PAID: 'بانتظار الدفع',
  PAID: 'مدفوع',
  PENDING: 'قيد المعالجة',
  REFUNDED: 'مسترد'
}

export default {
  setup() {
    const user = ref({
      full_name: '',
      email: '',
      university_number: '',
      role: '',
      newPassword: '',
      deposit: null
    })
    const loading = ref(true)
    const saving = ref(false)

    const fetchProfile = async () => {
      loading.value = true
      try {
        const res = await userService.getProfile()
        console.log(res)
        const data = res.data.data
        user.value = {
          ...user.value,
          full_name: data.full_name,
          email: data.email,
          university_number: data.university_number,
          role: data.role?.name || data.role || '',
          deposit: data.deposit ?? null
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchProfile)

    const saveChanges = async () => {
      saving.value = true
      try {
        const payload = {
          full_name: user.value.full_name
        }
        if (user.value.newPassword) {
          payload.password = user.value.newPassword
        }
        
        await userService.updateProfile(payload)
        alert("تم تحديث بياناتك بنجاح!")
        user.value.newPassword = ""
      } catch (err) {
        alert("خطأ في التحديث: " + (err.response?.data?.message || 'فشل الطلب'))
      } finally {
        saving.value = false
      }
    }

    const depositIsPaid = computed(() => user.value.deposit?.status === 'PAID')

    const depositStatusLabel = computed(() => {
      const status = user.value.deposit?.status
      if (!status) return 'لا تتوفر بيانات الإيداع'
      return DEPOSIT_STATUS_LABELS[status] || status
    })

    const isStudent = computed(() => {
      const r = String(user.value.role || '').toUpperCase()
      return r === 'STUDENT' || r === ''
    })

    const roleLabel = computed(() => {
      const r = String(user.value.role || '').toUpperCase()
      if (r === 'FACULTY')  return 'دكتور - جامعة قاسيون'
      if (r === 'EMPLOYEE') return 'موظف - جامعة قاسيون'
      return 'طالب بجامعة قاسيون'
    })

    return {
      user,
      loading,
      saving,
      saveChanges,
      depositIsPaid,
      depositStatusLabel,
      isStudent,
      roleLabel
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');

.profile-page-wrapper {
  padding: 40px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Tajawal', sans-serif;
}

.profile-card {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* الهيدر */
.profile-header {
  position: relative;
  text-align: center;
  padding-bottom: 20px;
}

.profile-cover {
  height: 160px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
}

.profile-avatar-section {
  margin-top: -60px;
  position: relative;
  z-index: 5;
}
.avatar-container {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: #2c3e50;
  border: 5px solid white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  position: relative;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #3498db;
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: 0.3s;
}

.profile-avatar-section h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
}

.user-role {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* المحتوى */
.profile-content {
  padding: 40px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.section-title {
  color: #2c3e50;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-weight: 700;
}

.section-title i {
  margin-left: 8px;
  color: #3498db;
}

/* تنسيق المدخلات */
.input-wrapper {
  margin-bottom: 20px;
}

.input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #bdc3c7;
}

.input-with-icon input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-family: inherit;
  transition: 0.3s;
  background: #fcfcfc;
}

.input-with-icon input:focus {
  border-color: #3498db;
  background: white;
  outline: none;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.1);
}

.input-with-icon.disabled input {
  background: #f5f6f7;
  color: #95a5a6;
  cursor: not-allowed;
}

.input-with-icon.staff-id input {
  background: linear-gradient(135deg, #f9f3ff, #fdf9ff);
  color: #7d3c98;
  font-weight: 700;
  letter-spacing: 1px;
  border: 1px dashed #d2b4de;
}

.hint-text {
  font-size: 0.75rem;
  color: #95a5a6;
  margin-top: 5px;
  display: block;
}

/* صندوق التأمين */
.insurance-box {
  background: #fff9f0;
  border: 1px solid #ffeaa7;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
}

.insurance-box.paid {
  background: #f0fff4;
  border-color: #c6f6d5;
}

.insurance-info .label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.status-msg {
  margin: 0;
  font-weight: 700;
  color: #27ae60;
}

.status-msg.unpaid {
  color: #e67e22;
}

.deposit-amount {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: #34495e;
}

.deposit-amount strong {
  color: #2c3e50;
}

.verified-icon {
  font-size: 1.5rem;
  color: #27ae60;
}

/* الفوتر */
.profile-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 15px;
}

.save-changes-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.save-changes-btn:hover { background: #1a252f; transform: translateY(-2px); }

.cancel-btn {
  background: #f0f2f5;
  color: #7f8c8d;
  border: none;
  padding: 12px 30px;
  border-radius: 10px;
  cursor: pointer;
}

/* تحسينات الشاشات الصغيرة */
@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; gap: 20px; }
  .profile-content { padding: 20px; }
}
</style>