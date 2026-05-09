<template>
  <div class="page-wrapper" dir="rtl">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <i class="fas fa-university"></i>
        <span>مكتبة جامعة قاسيون</span>
      </div>
      <div class="nav-links">
        <router-link to="/search" class="nav-link active">
          <i class="fas fa-search"></i> البحث
        </router-link>
        <router-link to="/history" class="nav-link">
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

    <!-- Main Layout -->
    <div class="main-layout">

      <!-- Sidebar -->
      <aside class="sidebar">
        <h4 class="sidebar-title"><i class="fas fa-th-large"></i> التصنيفات</h4>
        <ul class="category-list">
          <li
            v-for="cat in categories"
            :key="cat.value"
            :class="['category-item', selectedCategory === cat.value ? 'active' : '']"
            @click="selectedCategory = cat.value"
          >
            <i :class="cat.icon"></i>
            <span>{{ cat.label }}</span>
            <span class="count">{{ getCategoryCount(cat.value) }}</span>
          </li>
        </ul>

        <div class="sidebar-divider"></div>

        <h4 class="sidebar-title"><i class="fas fa-filter"></i> فلترة</h4>
        <label class="filter-check">
          <input type="checkbox" v-model="showAvailableOnly" />
          <span>متاح للاستعارة فقط</span>
        </label>
      </aside>

      <!-- Content Area -->
      <div class="content-area">

        <!-- Search Bar -->
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ابحث عن عنوان، مؤلف، أو رمز الكتاب..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Featured Book (only when no search) -->
        <div class="featured-section" v-if="!searchQuery && selectedCategory === 'all' && featuredBook">
          <div class="featured-label"><i class="fas fa-star"></i> مقترحات ذكية لك</div>
          <div class="featured-card">
            <img :src="'http://127.0.0.1:5000'+featuredBook.cover_image_url || 'https://via.placeholder.com/400x300?text=No+Cover'" alt="featured" class="featured-img" />
            <div class="featured-info">
              <span class="featured-category">{{ featuredBook.category?.name }}</span>
              <h2 class="featured-title">{{ featuredBook.title }}</h2>
              <p class="featured-author"><i class="fas fa-user-edit"></i> {{ featuredBook.authors?.map(a => a.full_name).join(', ') }}</p>
              <p class="featured-desc">{{ featuredBook.summary }}</p>
              <div class="featured-actions">
                <button class="btn-primary" @click="bookNow(featuredBook)">
                  <i class="fas fa-bookmark"></i> احجز الآن
                </button>
                <button class="btn-secondary" @click="viewDetails(featuredBook)">
                  إلقاء نظرة
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Books Section -->
        <div class="books-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-border-all"></i>
              {{ searchQuery ? 'نتائج البحث' : 'استكشف المكتبة' }}
            </h3>
            <span class="results-count">{{ filteredBooks.length }} كتاب</span>
          </div>

          <div class="books-grid" v-if="filteredBooks.length > 0">
            <div
              v-for="book in filteredBooks"
              :key="book.id"
              class="book-card"
            >
              <div class="book-image-wrapper">
                <img :src="'http://127.0.0.1:5000'+book.cover_image_url || 'https://via.placeholder.com/200x140?text=No+Cover'" :alt="book.title" class="book-img" />
                <span class="book-category-badge">{{ book.category?.name }}</span>
              </div>
              <div class="book-body">
                <h4 class="book-title">{{ book.title }}</h4>
                <p class="book-author"><i class="fas fa-pen-nib"></i> {{ book.authors?.map(a => a.full_name).join(', ') }}</p>
                <div class="book-footer">
                  <span :class="['availability', book.copies?.some(c => c.status === 'AVAILABLE') ? 'available' : 'unavailable']">
                    <i :class="book.copies?.some(c => c.status === 'AVAILABLE') ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                    {{ book.copies?.some(c => c.status === 'AVAILABLE') ? 'متاح للاستعارة' : 'غير متوفر حالياً' }}
                  </span>
                  <button class="details-btn" @click="viewDetails(book)">
                    <i class="fas fa-eye"></i> عرض التفاصيل
                  </button>
                  <button
                    class="reserve-btn"
                    :disabled="!book.copies?.some(c => c.status === 'AVAILABLE')"
                    @click="bookNow(book)"
                  >
                    {{ book.copies?.some(c => c.status === 'AVAILABLE') ? 'احجز الآن' : 'محجوز' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" v-else>
            <i class="fas fa-search"></i>
            <p>لا توجد نتائج لـ "{{ searchQuery }}"</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import { bookService } from '../../api/bookService'
import { loanService } from '../../api/loanService'
import { listFromResponse } from '../../api/responseUtils'

export default {
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const showAvailableOnly = ref(false)
    const books = ref([])
    const categories = ref([{ label: 'الكل', value: 'all', icon: 'fas fa-layer-group' }])
    const loading = ref(false)

    const featuredBook = computed(() => books.value?.[0] || null)

    const fetchCategories = async () => {
      try {
        const res = await bookService.getCategories()
        const fetchedCats = listFromResponse(res).map(c => ({
          label: c.name,
          value: c.id,
          icon: 'fas fa-book'
        }))
        categories.value = [{ label: 'الكل', value: 'all', icon: 'fas fa-layer-group' }, ...fetchedCats]
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    const fetchBooks = async () => {
      loading.value = true
      try {
        const q = searchQuery.value.trim()
        let res
        if (q) {
          const params = { page: 1, per_page: 100 }
          if (selectedCategory.value !== 'all') params.category_id = selectedCategory.value
          res = await bookService.searchBooks(q, params)
        } else {
          const params = { page: 1, per_page: 100 }
          if (selectedCategory.value !== 'all') params.category_id = selectedCategory.value
          res = await bookService.getBooks(params)
        }
        books.value = listFromResponse(res)
      } catch (err) {
        console.error('Error fetching books:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCategories()
      fetchBooks()
    })

    watch([searchQuery, selectedCategory, showAvailableOnly], () => {
      fetchBooks()
    })

    const filteredBooks = computed(() => {
      let list = books.value || []
      if (showAvailableOnly.value) {
        list = list.filter(b => b.copies?.some(c => c.status === 'AVAILABLE'))
      }
      return list
    })

    const getCategoryCount = (catId) => {
      if (catId === 'all') return books.value?.length || 0
      return books.value?.filter(b => b.category_id === catId).length || 0
    }

    const viewDetails = (book) => {
      router.push('/books/' + book.id)
    }

    const bookNow = async (book) => {
      if (!book.copies?.some(c => c.status === 'AVAILABLE')) {
        alert('لا توجد نسخ متاحة حالياً')
        return
      }
      try {
        await loanService.borrowBook(book.id)
        alert('تم حجز الكتاب بنجاح!')
        fetchBooks()
      } catch (err) {
        alert('خطأ في الحجز: ' + (err.response?.data?.message || 'فشل الطلب'))
      }
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      searchQuery, selectedCategory, showAvailableOnly, categories, 
      featuredBook, loading, filteredBooks, 
      getCategoryCount, viewDetails, bookNow, logout
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
}

/* ===== NAVBAR ===== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a2940;
  padding: 0 30px;
  height: 65px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.nav-brand {
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-brand i { color: #3498db; font-size: 1.3rem; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-link {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover, .nav-link.active { background: rgba(52,152,219,0.2); color: #3498db; }

.logout-btn {
  background: rgba(231,76,60,0.15);
  color: #e74c3c;
  border: 1px solid rgba(231,76,60,0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
  margin-right: 10px;
}

.logout-btn:hover { background: #e74c3c; color: white; }

/* ===== MAIN LAYOUT ===== */
.main-layout {
  display: flex;
  gap: 0;
  min-height: calc(100vh - 65px);
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #1e3a5f;
  padding: 25px 15px;
  color: white;
}

.sidebar-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.4);
  margin-bottom: 12px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-list {
  list-style: none;
  margin-bottom: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 4px;
}

.category-item i { width: 18px; text-align: center; }
.category-item span:nth-child(2) { flex: 1; }

.count {
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.category-item:hover { background: rgba(255,255,255,0.08); color: white; }
.category-item.active { background: #3498db; color: white; }
.category-item.active .count { background: rgba(255,255,255,0.2); }

.sidebar-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 20px 0;
}

.filter-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
}

.filter-check input { accent-color: #3498db; width: 16px; height: 16px; }

/* ===== CONTENT AREA ===== */
.content-area {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

/* ===== SEARCH BOX ===== */
.search-box {
  position: relative;
  margin-bottom: 25px;
}

.search-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 50px;
  border: 2px solid #e8ecf0;
  border-radius: 14px;
  font-size: 1rem;
  font-family: 'Tajawal', sans-serif;
  background: white;
  transition: 0.2s;
  outline: none;
  color: #2c3e50;
}

.search-input:focus { border-color: #3498db; box-shadow: 0 0 0 4px rgba(52,152,219,0.1); }

.clear-btn {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  font-size: 1rem;
}

/* ===== FEATURED CARD ===== */
.featured-section { margin-bottom: 30px; }

.featured-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e67e22;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.featured-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 4px 25px rgba(0,0,0,0.07);
  border: 1px solid #edf0f3;
}

.featured-img {
  width: 280px;
  min-height: 200px;
  object-fit: cover;
}

.featured-info {
  padding: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-category {
  background: #eaf4fd;
  color: #3498db;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 12px;
}

.featured-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a2940;
  margin-bottom: 8px;
}

.featured-author {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.featured-desc {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 20px;
}

.featured-actions { display: flex; gap: 12px; }

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-primary:hover { background: #2980b9; transform: translateY(-1px); }

.btn-secondary {
  background: white;
  color: #2c3e50;
  border: 2px solid #e0e6ed;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  transition: 0.2s;
}

.btn-secondary:hover { border-color: #3498db; color: #3498db; }

/* ===== BOOKS SECTION ===== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count {
  background: #eaf4fd;
  color: #3498db;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ===== BOOKS GRID ===== */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

.book-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
  border: 1px solid #edf0f3;
  transition: 0.25s;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.book-image-wrapper { position: relative; }

.book-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.book-category-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(26,41,64,0.8);
  color: white;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.book-body { padding: 14px; }

.book-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2940;
  margin-bottom: 5px;
  line-height: 1.4;
}

.book-author {
  font-size: 0.82rem;
  color: #95a5a6;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.book-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.availability {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.availability.available { color: #27ae60; }
.availability.unavailable { color: #e74c3c; }

.reserve-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  background: #3498db;
  color: white;
  transition: 0.2s;
}

.reserve-btn:hover:not(:disabled) { background: #2980b9; }
.reserve-btn:disabled { background: #dde2e8; color: #95a5a6; cursor: not-allowed; }

.details-btn {
  width: 100%;
  padding: 8px;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  background: white;
  color: #3498db;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.details-btn:hover { background: #eaf4fd; }

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
}

.empty-state i { font-size: 3rem; margin-bottom: 15px; display: block; }
.empty-state p { font-size: 1rem; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .sidebar { width: 100%; min-width: unset; }
  .category-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .category-item { padding: 7px 12px; font-size: 0.85rem; }
  .featured-card { flex-direction: column; }
  .featured-img { width: 100%; height: 180px; }
  .navbar { padding: 0 15px; }
  .nav-links .nav-link span { display: none; }
}
</style>
