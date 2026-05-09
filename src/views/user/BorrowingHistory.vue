<template>
  <div class="page-wrapper" dir="rtl">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <i class="fas fa-university"></i>
        <span>مكتبة جامعة قاسيون</span>
      </div>
      <div class="nav-links">
        <router-link to="/search" class="nav-link">
          <i class="fas fa-search"></i> البحث
        </router-link>
        <router-link to="/history" class="nav-link active">
          <i class="fas fa-history"></i> استعاراتي
        </router-link>
        <router-link to="/fines" class="nav-link">
          <i class="fas fa-coins"></i> الغرامات
        </router-link>
        <router-link to="/profile" class="nav-link">
          <i class="fas fa-user"></i> ملفي
        </router-link>
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i> خروج
        </button>
      </div>
    </nav>

    <div class="page-content">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title"><i class="fas fa-history"></i> سجل استعاراتي</h2>
          <p class="page-sub">تتبع كتبك المستعارة ومواعيد الإرجاع</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill blue">
            <i class="fas fa-book-open"></i>
            <div>
              <span class="stat-num">{{ history.length }}</span>
              <span class="stat-lbl">إجمالي الكتب</span>
            </div>
          </div>
          <div class="stat-pill green">
            <i class="fas fa-check-circle"></i>
            <div>
              <span class="stat-num">{{ returnedCount }}</span>
              <span class="stat-lbl">مُرجَعة</span>
            </div>
          </div>
          <div class="stat-pill orange">
            <i class="fas fa-clock"></i>
            <div>
              <span class="stat-num">{{ activeCount }}</span>
              <span class="stat-lbl">قيد الاستعارة</span>
            </div>
          </div>
          <div class="stat-pill red">
            <i class="fas fa-coins"></i>
            <div>
              <span class="stat-num">{{ totalFines }} ل.س</span>
              <span class="stat-lbl">الغرامات</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="['filter-btn', activeFilter === f.value ? 'active' : '']"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
        <div class="filter-spacer"></div>
        <div class="search-mini">
          <i class="fas fa-search"></i>
          <input v-model="searchText" placeholder="ابحث في السجل..." />
        </div>
      </div>

      <!-- Cards -->
      <div class="cards-grid">
        <div
          v-for="record in displayedRecords"
          :key="record.id"
          class="borrow-card"
          :class="record.status === 'RETURNED' ? 'card-returned' : (record.status === 'OVERDUE' ? 'card-overdue' : 'card-active')"
        >
          <div class="card-top">
            <img v-if="record.book?.cover_image_url" 
                 :src="'http://127.0.0.1:5000' + record.book.cover_image_url" 
                 class="book-cover-img" 
                 :alt="record.book?.title" />
            <div v-else class="book-icon-wrap" :class="record.status === 'RETURNED' ? 'icon-green' : 'icon-blue'">
              <i class="fas fa-book"></i>
            </div>
            <div class="card-meta">
              <h4 class="card-book-title">{{ record.book?.title }}</h4>
              <span class="card-author"><i class="fas fa-pen-nib"></i> {{ record.book?.authors?.map(a => a.full_name).join(', ') }}</span>
            </div>
            <span :class="['status-tag', record.status === 'RETURNED' ? 'tag-returned' : (record.status === 'OVERDUE' ? 'tag-overdue' : 'tag-active')]">
              <i :class="record.status === 'RETURNED' ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
              {{ record.status === 'RETURNED' ? 'مُرجَعة' : (record.status === 'OVERDUE' ? `متأخر (${record.overdue_days} أيام)` : 'قيد الاستعارة') }}
            </span>
          </div>

          <div class="card-divider"></div>

          <div class="card-details">
            <div class="detail-item">
              <span class="detail-icon"><i class="far fa-calendar-alt"></i></span>
              <div>
                <span class="detail-label">تاريخ الاستعارة</span>
                <span class="detail-value">{{ record.borrow_date }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon"><i class="far fa-calendar-check"></i></span>
              <div>
                <span class="detail-label">موعد الإرجاع</span>
                <span class="detail-value" :class="record.status === 'OVERDUE' ? 'text-red' : ''">{{ record.due_date }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon" :class="record.fine_amount > 0 ? 'icon-red' : ''"><i class="fas fa-coins"></i></span>
              <div>
                <span class="detail-label">الغرامة</span>
                <span class="detail-value" :class="record.fine_amount > 0 ? 'text-red' : 'text-green'">
                  {{ record.fine_amount > 0 ? record.fine_amount + ' ل.س' : 'لا يوجد' }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-outline" @click="showInfo(record)">
              <i class="fas fa-info-circle"></i> التفاصيل
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedRecords.length === 0" class="empty-state">
        <i class="fas fa-book-open"></i>
        <p>لا توجد نتائج</p>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import { loanService } from '../../api/loanService'
import { listFromResponse } from '../../api/responseUtils'

export default {
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const history = ref([])
    const loading = ref(true)
    const activeFilter = ref('all')
    const searchText = ref('')
    const filters = [
      { label: 'الكل', value: 'all' },
      { label: 'قيد الاستعارة', value: 'ACTIVE' },
      { label: 'متأخر', value: 'OVERDUE' },
      { label: 'مُرجَعة', value: 'RETURNED' },
    ]

    const fetchHistory = async () => {
      loading.value = true
      try {
        const res = await loanService.getMyLoans()
        console.log("USER LOANS", res)
        const now = new Date()
        history.value = listFromResponse(res).map(r => {
          let status = r.status
          let overdue_days = 0
          if (status === 'ACTIVE' && r.due_at && new Date(r.due_at) < now) {
             status = 'OVERDUE'
          }
          if (status === 'OVERDUE' && r.due_at) {
             const due = new Date(r.due_at)
             overdue_days = Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)))
          }
          return {
            ...r,
            status,
            overdue_days,
            borrow_date: r.loaned_at ? new Date(r.loaned_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'غير محدد',
            due_date: r.due_at ? new Date(r.due_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'غير محدد',
            fine_amount: r.fine_amount || 0
          }
        })
      } catch (err) {
        console.error('Error fetching loans:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchHistory)

    const totalFines = computed(() => history.value.reduce((s, i) => s + (i.fine_amount || 0), 0))
    const returnedCount = computed(() => history.value.filter(i => i.status === 'RETURNED').length)
    const activeCount = computed(() => history.value.filter(i => i.status === 'ACTIVE' || i.status === 'OVERDUE').length)

    const displayedRecords = computed(() => {
      return (history.value || []).filter(r => {
        const matchFilter = activeFilter.value === 'all' || r.status === activeFilter.value
        const matchSearch = !searchText.value || 
          r.book?.title?.includes(searchText.value) || 
          r.book?.authors?.some(a => a.full_name?.includes(searchText.value))
        return matchFilter && matchSearch
      })
    })

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    const showInfo = (record) => {
      const id = record.book_id ?? record.book?.id
      if (id) router.push('/books/' + id)
    }

    return {
      activeFilter, searchText, filters, history, loading,
      totalFines, returnedCount, activeCount, displayedRecords,
      logout, showInfo
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper { min-height: 100vh; background: #f0f2f5; font-family: 'Tajawal', sans-serif; direction: rtl; }

/* NAVBAR */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  background: #1a2940; padding: 0 30px; height: 65px;
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
}
.nav-brand { color: white; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.nav-brand i { color: #3498db; font-size: 1.3rem; }
.nav-links { display: flex; align-items: center; gap: 5px; }
.nav-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.nav-link:hover, .nav-link.active { background: rgba(52,152,219,0.2); color: #3498db; }
.logout-btn { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; transition: 0.2s; margin-right: 10px; }
.logout-btn:hover { background: #e74c3c; color: white; }

/* CONTENT */
.page-content { max-width: 1100px; margin: 0 auto; padding: 30px 25px; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #1a2940; display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.page-sub { color: #95a5a6; font-size: 0.9rem; }
.header-stats { display: flex; gap: 12px; flex-wrap: wrap; }

.stat-pill {
  display: flex; align-items: center; gap: 12px;
  background: white; padding: 12px 18px; border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #edf0f3;
}
.stat-pill i { font-size: 1.3rem; }
.stat-pill.blue i { color: #3498db; }
.stat-pill.green i { color: #27ae60; }
.stat-pill.orange i { color: #e67e22; }
.stat-pill.red i { color: #e74c3c; }
.stat-num { display: block; font-size: 1.1rem; font-weight: 800; color: #1a2940; }
.stat-lbl { display: block; font-size: 0.72rem; color: #95a5a6; }

/* FILTER BAR */
.filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
.filter-btn { padding: 8px 18px; border-radius: 20px; border: 2px solid #e0e6ed; background: white; color: #7f8c8d; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 500; transition: 0.2s; }
.filter-btn.active, .filter-btn:hover { border-color: #3498db; background: #3498db; color: white; }
.filter-spacer { flex: 1; }
.search-mini { display: flex; align-items: center; gap: 8px; background: white; border: 2px solid #e0e6ed; border-radius: 10px; padding: 8px 14px; }
.search-mini i { color: #aab7c4; font-size: 0.85rem; }
.search-mini input { border: none; outline: none; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; color: #2c3e50; width: 180px; }

/* CARDS GRID */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }

.borrow-card {
  background: white; border-radius: 18px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
  border: 1px solid #edf0f3;
  overflow: hidden; transition: 0.25s;
}
.borrow-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }

.card-top { display: flex; align-items: flex-start; gap: 14px; padding: 20px 20px 16px; }

.book-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
}
.book-cover-img {
  width: 48px; height: 64px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  border: 1px solid #edf0f3;
}
.icon-blue { background: #eaf4fd; color: #3498db; }
.icon-green { background: #eafaf1; color: #27ae60; }

.card-meta { flex: 1; }
.card-book-title { font-size: 0.95rem; font-weight: 700; color: #1a2940; line-height: 1.4; margin-bottom: 4px; }
.card-author { font-size: 0.8rem; color: #95a5a6; display: flex; align-items: center; gap: 5px; }

.status-tag {
  flex-shrink: 0; padding: 5px 11px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
  display: flex; align-items: center; gap: 5px;
}
.tag-active { background: #fef9e7; color: #d68910; }
.tag-returned { background: #eafaf1; color: #1e8449; }

.card-divider { height: 1px; background: #f0f3f6; margin: 0 20px; }

.card-details { display: flex; gap: 0; padding: 16px 20px; }
.detail-item { flex: 1; display: flex; align-items: center; gap: 10px; }
.detail-item + .detail-item { border-right: 1px solid #f0f3f6; padding-right: 15px; margin-right: 5px; }
.detail-icon { color: #bdc3c7; font-size: 1rem; }
.icon-red { color: #e74c3c !important; }
.detail-label { display: block; font-size: 0.7rem; color: #aab7c4; margin-bottom: 2px; }
.detail-value { display: block; font-size: 0.82rem; font-weight: 600; color: #2c3e50; }
.text-warn { color: #e67e22; }
.text-red { color: #e74c3c; }
.text-green { color: #27ae60; }

.card-actions { display: flex; gap: 10px; padding: 14px 20px; background: #fafbfc; border-top: 1px solid #f0f3f6; }
.action-outline { flex: 1; padding: 9px; border: 2px solid #e0e6ed; background: white; color: #7f8c8d; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.88rem; font-weight: 600; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.action-outline:hover { border-color: #3498db; color: #3498db; }
.action-renew { flex: 1; padding: 9px; border: none; background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.88rem; font-weight: 600; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.action-renew:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,134,193,0.3); }

/* EMPTY */
.empty-state { text-align: center; padding: 60px; color: #bdc3c7; }
.empty-state i { font-size: 3rem; margin-bottom: 12px; display: block; }
</style>
