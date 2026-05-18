<template>
  <div class="page-wrapper" dir="rtl">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <i class="fas fa-university"></i>
        <span>مكتبة جامعة قاسيون</span>
      </div>
      <div class="nav-links">
        <router-link to="/search" class="nav-link"><i class="fas fa-search"></i> البحث</router-link>
        <router-link to="/history" class="nav-link"><i class="fas fa-history"></i> استعاراتي</router-link>
        <router-link to="/profile" class="nav-link"><i class="fas fa-user"></i> ملفي</router-link>
        <button class="logout-btn" @click="logout"><i class="fas fa-sign-out-alt"></i> خروج</button>
      </div>
    </nav>

    <div class="detail-content" v-if="book">
      <!-- زر الرجوع -->
      <button class="back-btn" @click="$router.back()">
        <i class="fas fa-arrow-right"></i> رجوع للبحث
      </button>

      <!-- بطاقة التفاصيل -->
      <div class="book-detail-card">
        <!-- الصورة -->
        <div class="book-cover-wrap">
          <img :src="'http://127.0.0.1:5000'+book.cover_image_url || 'https://via.placeholder.com/220x290?text=No+Cover'" :alt="book.title" class="book-cover" />
          <span :class="['avail-badge', isAvailable ? 'avail-yes' : 'avail-no']">
            <i :class="isAvailable ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
            {{ isAvailable ? 'متاح للاستعارة' : 'غير متاح حالياً' }}
          </span>
        </div>

        <!-- المعلومات -->
        <div class="book-info">
          <span class="cat-badge">{{ book.category?.name }}</span>
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author"><i class="fas fa-pen-nib"></i> {{ book.authors?.map(a => a.full_name).join(', ') }}</p>

          <p class="book-summary">{{ book.summary }}</p>

          <!-- معلومات إضافية -->
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-calendar-alt"></i></span>
              <div><span class="meta-label">سنة النشر</span><span class="meta-val">{{ book.publish_year }}</span></div>
            </div>
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-language"></i></span>
              <div><span class="meta-label">اللغة</span><span class="meta-val">{{ book.language }}</span></div>
            </div>
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-copy"></i></span>
              <div><span class="meta-label">النسخ المتاحة</span><span class="meta-val">{{ availableCopiesCount }} من {{ book.copies?.length }}</span></div>
            </div>
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-building"></i></span>
              <div><span class="meta-label">دار النشر</span><span class="meta-val">{{ book.publisher?.name }}</span></div>
            </div>
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-barcode"></i></span>
              <div><span class="meta-label">ISBN</span><span class="meta-val">{{ book.isbn }}</span></div>
            </div>
            <div class="meta-item" v-if="bookLocations && bookLocations.length > 0">
              <span class="meta-icon"><i class="fas fa-map-marker-alt"></i></span>
              <div>
                <span class="meta-label">موقع الكتاب</span>
                <span class="meta-val">
                  <div v-for="(loc, index) in bookLocations" :key="index" style="margin-bottom: 4px;">
                    {{ loc }}
                  </div>
                </span>
              </div>
            </div>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="action-row">
            <button
              class="reserve-btn"
              :disabled="!isAvailable"
              @click="reserve"
            >
              <i class="fas fa-bookmark"></i>
              {{ isAvailable ? 'احجز الآن' : 'غير متاح' }}
            </button>
            <button class="back-action-btn" @click="$router.back()">
              <i class="fas fa-arrow-right"></i> رجوع
            </button>
          </div>
        </div>
      </div>

      <!-- كتب مشابهة -->
      <div class="related-section" v-if="relatedBooks.length">
        <h3 class="related-title"><i class="fas fa-book-open"></i> كتب مشابهة</h3>
        <div class="related-grid">
          <div v-for="rb in relatedBooks" :key="rb.id" class="related-card" @click="$router.push('/books/' + rb.id)">
            <img :src="'http://127.0.0.1:5000'+rb.cover_image_url || 'https://via.placeholder.com/45x55?text=Img'" class="related-img" />
            <div class="related-info">
              <span class="related-book-title">{{ rb.title }}</span>
              <span class="related-author">{{ rb.authors?.map(a => a.full_name).join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>جاري تحميل بيانات الكتاب...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import { bookService } from '../../api/bookService'
import { loanService } from '../../api/loanService'
import { listFromResponse } from '../../api/responseUtils'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const book = ref(null)
    const loading = ref(true)
    const relatedBooks = ref([])

    const fetchBook = async () => {
      loading.value = true
      try {
        const res = await bookService.getBook(route.params.id)
        book.value = res.data.data
        // For simplicity, fetch all books as related
        const allBooks = await bookService.getBooks({ category_id: book.value.category_id, per_page: 50 })
        relatedBooks.value = listFromResponse(allBooks).filter(b => b.id !== book.value.id).slice(0, 3)
      } catch (err) {
        console.error('Error fetching book:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchBook)

    const formatLocationLabel = (loc) => {
      if (!loc) return ''
      const parts = [
        loc.library_name,
        loc.floor ? `طابق ${loc.floor}` : '',
        loc.section ? `قسم ${loc.section}` : '',
        loc.aisle ? `ممر ${loc.aisle}` : '',
        loc.shelf ? `رف ${loc.shelf}` : '',
        loc.position ? `موضع ${loc.position}` : ''
      ].filter(Boolean)
      return parts.join(' | ')
    }

    const bookLocations = computed(() => {
      if (!book.value?.copies) return []
      const locs = book.value.copies.map(c => c.location).filter(Boolean)
      const uniqueLocLabels = [...new Set(locs.map(l => formatLocationLabel(l)))]
      return uniqueLocLabels
    })

    const isAvailable = computed(() => {
      return (book.value?.copies || []).some(c => c.status === 'AVAILABLE')
    })

    const availableCopiesCount = computed(() => {
      return (book.value?.copies || []).filter(c => c.status === 'AVAILABLE').length
    })

    const reserve = async () => {
      if (!book.value?.copies?.some(c => c.status === 'AVAILABLE')) {
        alert('لا توجد نسخ متاحة حالياً')
        return
      }
      try {
        await loanService.borrowBook(book.value.id)
        alert('تم الحجز بنجاح! يمكنك استلام الكتاب من المكتبة خلال 48 ساعة.')
        fetchBook()
      } catch (err) {
        alert('خطأ في الحجز: ' + (err.response?.data?.message || 'فشل الطلب'))
      }
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      book, loading, relatedBooks, isAvailable, availableCopiesCount, reserve, logout, bookLocations
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
.navbar { display: flex; justify-content: space-between; align-items: center; background: #1a2940; padding: 0 30px; height: 65px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
.nav-brand { color: white; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.nav-brand i { color: #3498db; font-size: 1.3rem; }
.nav-links { display: flex; align-items: center; gap: 5px; }
.nav-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.nav-link:hover { background: rgba(52,152,219,0.2); color: #3498db; }
.logout-btn { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; transition: 0.2s; margin-right: 10px; }
.logout-btn:hover { background: #e74c3c; color: white; }

/* CONTENT */
.detail-content { max-width: 1000px; margin: 0 auto; padding: 30px 25px; }

.back-btn { background: white; border: 2px solid #e0e6ed; color: #7f8c8d; padding: 9px 18px; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 22px; transition: 0.2s; }
.back-btn:hover { border-color: #3498db; color: #3498db; }

/* BOOK DETAIL CARD */
.book-detail-card { background: white; border-radius: 20px; padding: 35px; display: flex; gap: 40px; box-shadow: 0 4px 25px rgba(0,0,0,0.07); border: 1px solid #edf0f3; margin-bottom: 28px; }

.book-cover-wrap { position: relative; flex-shrink: 0; }
.book-cover { width: 220px; height: 290px; object-fit: cover; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: block; }
.avail-badge { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; margin-top: 14px; justify-content: center; }
.avail-yes { background: #eafaf1; color: #1e8449; }
.avail-no { background: #fdf0f0; color: #c0392b; }

/* BOOK INFO */
.book-info { flex: 1; }
.cat-badge { background: #eaf4fd; color: #2e86c1; padding: 5px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; display: inline-block; margin-bottom: 14px; }
.book-title { font-size: 1.7rem; font-weight: 800; color: #1a2940; margin-bottom: 10px; line-height: 1.3; }
.book-author { color: #7f8c8d; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; gap: 7px; }

.rating-row { display: flex; align-items: center; gap: 4px; margin-bottom: 16px; }
.star { font-size: 1.2rem; color: #dde2e8; }
.star.filled { color: #f39c12; }
.rating-num { font-size: 0.85rem; color: #7f8c8d; margin-right: 6px; }

.book-summary { color: #555; font-size: 0.92rem; line-height: 1.8; margin-bottom: 22px; }

/* META GRID */
.meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.meta-item { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 11px 14px; border-radius: 10px; border: 1px solid #edf0f3; }
.meta-icon { color: #3498db; font-size: 0.95rem; width: 20px; text-align: center; flex-shrink: 0; }
.meta-label { display: block; font-size: 0.7rem; color: #95a5a6; margin-bottom: 2px; }
.meta-val { display: block; font-size: 0.88rem; font-weight: 600; color: #2c3e50; }

/* ACTION ROW */
.action-row { display: flex; gap: 12px; }
.reserve-btn { flex: 2; padding: 13px; background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; border: none; border-radius: 12px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 15px rgba(46,134,193,0.3); }
.reserve-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 20px rgba(46,134,193,0.4); }
.reserve-btn:disabled { background: #dde2e8; color: #95a5a6; cursor: not-allowed; box-shadow: none; }
.back-action-btn { flex: 1; padding: 13px; background: white; color: #7f8c8d; border: 2px solid #e0e6ed; border-radius: 12px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.back-action-btn:hover { border-color: #3498db; color: #3498db; }

/* RELATED */
.related-section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); border: 1px solid #edf0f3; }
.related-title { font-size: 1rem; font-weight: 700; color: #1a2940; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.related-grid { display: flex; gap: 14px; flex-wrap: wrap; }
.related-card { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #edf0f3; border-radius: 12px; padding: 10px 14px; cursor: pointer; transition: 0.2s; flex: 1; min-width: 200px; }
.related-card:hover { border-color: #3498db; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.related-img { width: 45px; height: 55px; object-fit: cover; border-radius: 7px; flex-shrink: 0; }
.related-book-title { display: block; font-size: 0.88rem; font-weight: 700; color: #1a2940; margin-bottom: 4px; }
.related-author { display: block; font-size: 0.78rem; color: #95a5a6; }

@media (max-width: 768px) {
  .book-detail-card { flex-direction: column; padding: 20px; }
  .book-cover { width: 160px; height: 210px; margin: 0 auto; }
  .book-cover-wrap { text-align: center; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
  .navbar { padding: 0 15px; }
}
</style>
