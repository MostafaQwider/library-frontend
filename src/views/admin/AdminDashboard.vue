<template>
  <div class="page-wrapper" dir="rtl">

    <!-- ===== Toast Notification ===== -->
    <transition name="toast-slide">
      <div v-if="toast.visible" :class="['toast-notification', 'toast-' + toast.type]">
        <div class="toast-icon">
          <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-msg">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="toast.visible = false"><i class="fas fa-times"></i></button>
      </div>
    </transition>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <i class="fas fa-university"></i>
        <span>مكتبة جامعة قاسيون</span>
      </div>
      <div class="nav-center">
        <span class="admin-badge"><i class="fas fa-shield-alt"></i> لوحة أمين المكتبة</span>
      </div>
      <div class="nav-links">
        <div class="nav-user">
          <div class="user-avatar"><i class="fas fa-user-tie"></i></div>
          <span>{{ adminName }}</span>
        </div>
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i> خروج
        </button>
      </div>
    </nav>

    <div class="main-layout">

      <!-- Sidebar -->
      <aside class="sidebar">
        <ul class="sidebar-menu">
          <li
            v-for="item in menuItems"
            :key="item.key"
            :class="['menu-item', activeTab === item.key ? 'active' : '']"
            @click="activeTab = item.key"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
          </li>
        </ul>
      </aside>

      <!-- Content -->
      <div class="content-area">

        <!-- ===== الإحصائيات ===== -->
        <div v-if="activeTab === 'overview'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-chart-pie"></i> نظرة عامة</h2>
            <span class="page-date">{{ today }}</span>
          </div>

          <div class="stats-grid">
            <div class="stat-card blue">
              <div class="stat-icon"><i class="fas fa-book"></i></div>
              <div class="stat-info">
                <span class="stat-num">{{ stats.totalBooks }}</span>
                <span class="stat-label">إجمالي الكتب</span>
              </div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <div class="stat-info">
                <span class="stat-num">{{ stats.totalUsers }}</span>
                <span class="stat-label">المستخدمون النشطون</span>
              </div>
            </div>
            <div class="stat-card orange">
              <div class="stat-icon"><i class="fas fa-book-open"></i></div>
              <div class="stat-info">
                <span class="stat-num">{{ stats.activeLoansCount }}</span>
                <span class="stat-label">استعارة نشطة</span>
              </div>
            </div>
            <div class="stat-card red">
              <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
              <div class="stat-info">
                <span class="stat-num">{{ stats.overdueLoansCount }}</span>
                <span class="stat-label">استعارات متأخرة</span>
              </div>
            </div>
          </div>

          <!-- آخر الاستعارات -->
          <div class="section-card">
            <div class="section-card-header">
              <h3><i class="fas fa-clock"></i> آخر الاستعارات</h3>
              <button class="view-all-btn" @click="activeTab = 'loans'">عرض الكل</button>
            </div>
            <table class="data-table">
              <thead>
                <tr><th>المستخدم</th><th>الكتاب</th><th>تاريخ الاستعارة</th><th>موعد الإرجاع</th><th>الحالة</th></tr>
              </thead>
              <tbody>
                <tr v-for="loan in recentLoans" :key="loan.id">
                  <td><div class="user-cell"><div class="mini-avatar-tbl">{{ loan.user?.full_name?.[0] || 'U' }}</div>{{ loan.user?.full_name }}</div></td>
                  <td class="book-cell">{{ loan.book?.title }}</td>
                  <td>{{ loan.borrow_date }}</td>
                  <td :class="loan.status === 'OVERDUE' ? 'text-red' : ''">{{ loan.due_date }}</td>
                  <td><span :class="['status-pill', loan.status === 'ACTIVE' ? 'pill-active' : loan.status === 'OVERDUE' ? 'pill-overdue' : 'pill-returned']">{{ loan.status === 'RETURNED' ? 'مُرجَعة' : (loan.status === 'OVERDUE' ? `متأخر (${loan.overdue_days} أيام)` : 'نشطة') }}</span></td>
                  <td>
                    <button class="act-edit" @click="viewLoan(loan)" title="تفاصيل"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== إدارة الكتب ===== -->
        <div v-if="activeTab === 'books'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-book"></i> إدارة الكتب</h2>
            <button class="add-btn" @click="showAddBook = true">
              <i class="fas fa-plus"></i> إضافة كتاب
            </button>
          </div>

          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="bookSearch" placeholder="ابحث عن كتاب..." />
            </div>
            <button v-for="f in bookFilters" :key="f.v" :class="['filter-btn', bookFilter === f.v ? 'active' : '']" @click="bookFilter = f.v">{{ f.l }}</button>
          </div>

          <div class="section-card">
            <table class="data-table">
              <thead>
                <tr><th>الغلاف</th><th>العنوان</th><th>المؤلف</th><th>التصنيف</th><th>النسخ</th><th>الحالة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                <tr v-for="book in filteredAdminBooks" :key="book.id">
                  <td><img :src="'http://127.0.0.1:5000' + book.cover_image_url || 'https://via.placeholder.com/60x80?text=No+Cover'" class="book-thumb" /></td>
                  <td class="bold-cell">{{ book.title }}</td>
                  <td>{{ book.authors?.map(a => a.full_name).join(', ') }}</td>
                  <td><span class="cat-badge">{{ book.category?.name }}</span></td>
                  <td>{{ book.copies?.length }} نسخة</td>
                  <td><span :class="['status-pill', book.copies?.some(c => c.status === 'AVAILABLE') ? 'pill-active' : 'pill-overdue']">{{ book.copies?.some(c => c.status === 'AVAILABLE') ? 'متاح' : 'معار بالكامل' }}</span></td>
                  <td>
                    <div class="action-btns">
                      <button class="act-edit" @click="editBook(book)"><i class="fas fa-edit"></i></button>
                      <button class="act-delete" @click="deleteBook(book)"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== إدارة الاستعارات ===== -->
        <div v-if="activeTab === 'loans'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-exchange-alt"></i> إدارة الاستعارات</h2>
            <button class="add-btn" @click="showNewLoan = true">
              <i class="fas fa-plus"></i> تسجيل استعارة جديدة
            </button>
          </div>

          <div class="filter-bar">
            <button v-for="f in loanFilters" :key="f.v" :class="['filter-btn', loanFilter === f.v ? 'active' : '']" @click="loanFilter = f.v">{{ f.l }}</button>
            <div class="filter-spacer"></div>
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="loanSearch" placeholder="ابحث..." />
            </div>
          </div>

          <div class="section-card">
            <table class="data-table">
              <thead>
                <tr><th>المستخدم</th><th>الكتاب</th><th>استعارة</th><th>إرجاع</th><th>الحالة</th><th>الغرامة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                <tr v-for="loan in filteredLoans" :key="loan.id">
                  <td><div class="user-cell"><div class="mini-avatar-tbl">{{ loan.user?.full_name?.[0] }}</div>{{ loan.user?.full_name }}</div></td>
                  <td class="book-cell">{{ loan.book?.title }}</td>
                  <td>{{ loan.borrow_date }}</td>
                  <td :class="loan.status === 'OVERDUE' ? 'text-red fw-bold' : ''">{{ loan.due_date }}</td>
                  <td><span :class="['status-pill', loan.status === 'ACTIVE' ? 'pill-active' : loan.status === 'OVERDUE' ? 'pill-overdue' : 'pill-returned']">{{ loan.status === 'RETURNED' ? 'مُرجَعة' : (loan.status === 'OVERDUE' ? `متأخر (${loan.overdue_days} أيام)` : 'نشطة') }}</span></td>
                  <td :class="loan.fine_amount > 0 ? 'text-red' : 'text-green'">{{ loan.fine_amount > 0 ? loan.fine_amount + ' ل.س' : '—' }}</td>
                  <td>
                    <div class="action-btns">
                      <button v-if="loan.status !== 'RETURNED'" class="act-return" @click="returnBookAction(loan)"><i class="fas fa-undo"></i> إرجاع</button>
                      <button class="act-edit" @click="viewLoan(loan)" title="تفاصيل"><i class="fas fa-eye"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== إدارة المستخدمين ===== -->
        <div v-if="activeTab === 'users'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-users"></i> إدارة المستخدمين</h2>
            <button class="add-btn" @click="showAddUser = true">
              <i class="fas fa-plus"></i> إضافة مستخدم
            </button>
          </div>

          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="userSearch" placeholder="ابحث عن مستخدم..." />
            </div>
            <button v-for="f in userFilters" :key="f.v" :class="['filter-btn', userFilter === f.v ? 'active' : '']" @click="userFilter = f.v">{{ f.l }}</button>
          </div>

          <div class="section-card">
            <table class="data-table">
              <thead>
                <tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>الموبايل</th><th>الحالة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="mini-avatar-tbl">{{ user.full_name?.[0] }}</div>
                      <div>
                        <div class="fw-bold">{{ user.full_name }}</div>
                        <div class="text-small text-muted">{{ user.university_number }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-small">{{ user.email }}</td>
                  <td><span :class="['role-badge', 'role-' + String(user.role?.name || user.role || '').toLowerCase()]">{{ user.role?.name || user.role }}</span></td>
                  <td class="text-small">{{ user.phone || 'غير متوفر' }}</td>
                  <td><span :class="['status-pill', user.status === 'ACTIVE' ? 'pill-active' : 'pill-overdue']">{{ user.status }}</span></td>
                  <td>
                    <div class="action-btns">
                      <button
                        v-if="user.deposit?.status === 'NOT_PAID'"
                        class="act-return"
                        title="تأكيد الإيداع"
                        @click="confirmUserDeposit(user)"
                      >
                        <i class="fas fa-money-bill-wave"></i>
                      </button>
                      <button class="act-edit" @click="editUser(user)"><i class="fas fa-edit"></i></button>
                      <button :class="user.status === 'ACTIVE' ? 'act-delete' : 'act-return'" @click="toggleUserStatus(user)">
                        <i :class="user.status === 'ACTIVE' ? 'fas fa-ban' : 'fas fa-check'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== الغرامات ===== -->
        <div v-if="activeTab === 'fines'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-coins"></i> إدارة الغرامات</h2>
            <div class="header-stat-pill">
              إجمالي الغرامات المعلقة: <strong>{{ totalPendingFines }} ل.س</strong>
            </div>
          </div>

          <div class="section-card">
            <table class="data-table">
              <thead>
                <tr><th>المستخدم</th><th>الكتاب</th><th>نوع الغرامة</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                <tr v-for="fine in fines" :key="fine.id">
                  <td><div class="user-cell"><div class="mini-avatar-tbl">{{ fine.user?.full_name?.[0] }}</div>{{ fine.user?.full_name }}</div></td>
                  <td class="book-cell">{{ fine.loan?.book?.title }}</td>
                  <td>{{ fine.reason }}</td>
                  <td class="text-red fw-bold">{{ fine.amount }} ل.س</td>
                  <td>{{ fine.created_at }}</td>
                  <td><span :class="['status-pill', fine.status === 'UNPAID' ? 'pill-overdue' : 'pill-active']">{{ fine.status }}</span></td>
                  <td>
                    <button v-if="fine.status === 'UNPAID'" class="act-return" @click="markFinePaid(fine)">
                      <i class="fas fa-check"></i> تأكيد الدفع
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'categories'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-tags"></i> إدارة التصنيفات</h2>
          </div>
          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="categorySearch" placeholder="ابحث عن تصنيف..." />
            </div>
          </div>
          <div class="section-card" style="padding:16px;">
            <div class="quick-add-bar full-width">
              <input v-model="quickCategoryName" type="text" placeholder="اسم التصنيف" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addCategoryQuick">إضافة</button>
            </div>
            <table class="data-table">
              <thead><tr><th>#</th><th>الاسم</th><th>إجراءات</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredCategories" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ row.name }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="act-edit" @click="editCategory(row)"><i class="fas fa-edit"></i></button>
                      <button class="act-delete" @click="deleteCategory(row)"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'publishers'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-building"></i> إدارة الناشرين</h2>
          </div>
          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="publisherSearch" placeholder="ابحث عن ناشر..." />
            </div>
          </div>
          <div class="section-card" style="padding:16px;">
            <div class="quick-add-bar full-width">
              <input v-model="quickPublisherName" type="text" placeholder="اسم الناشر" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addPublisherQuick">إضافة</button>
            </div>
            <table class="data-table">
              <thead><tr><th>#</th><th>الاسم</th><th>إجراءات</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredPublishers" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ row.name }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="act-edit" @click="editPublisher(row)"><i class="fas fa-edit"></i></button>
                      <button class="act-delete" @click="deletePublisher(row)"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'authors'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-pen-nib"></i> إدارة المؤلفين</h2>
          </div>
          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="authorSearch" placeholder="ابحث عن مؤلف..." />
            </div>
          </div>
          <div class="section-card" style="padding:16px;">
            <div class="quick-add-bar full-width">
              <input v-model="quickAuthorName" type="text" placeholder="الاسم الكامل للمؤلف" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addAuthorQuick">إضافة</button>
            </div>
            <table class="data-table">
              <thead><tr><th>#</th><th>الاسم</th><th>إجراءات</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredAuthors" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ row.full_name }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="act-edit" @click="editAuthor(row)"><i class="fas fa-edit"></i></button>
                      <button class="act-delete" @click="deleteAuthor(row)"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'locations'">
          <div class="page-header">
            <h2 class="page-title"><i class="fas fa-map-marker-alt"></i> إدارة مواقع الكتب</h2>
          </div>
          <div class="filter-bar">
            <div class="search-mini">
              <i class="fas fa-search"></i>
              <input v-model="locationSearch" placeholder="ابحث عن موقع..." />
            </div>
          </div>
          <div class="section-card" style="padding:16px;">
            <div class="quick-add-bar full-width">
              <input v-model="quickLocation.library_name" type="text" placeholder="اسم المكتبة" />
              <input v-model="quickLocation.floor" type="text" placeholder="الطابق" />
              <input v-model="quickLocation.section" type="text" placeholder="القسم" />
              <input v-model="quickLocation.aisle" type="text" placeholder="الممر" />
              <input v-model="quickLocation.shelf" type="text" placeholder="الرف" />
              <input v-model="quickLocation.position" type="text" placeholder="الموضع" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addLocationQuick">إضافة</button>
            </div>
            <table class="data-table">
              <thead><tr><th>#</th><th>الموقع الكامل</th><th>إجراءات</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredLocations" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ formatLocationLabel(row) }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="act-edit" @click="editLocation(row)"><i class="fas fa-edit"></i></button>
                      <button class="act-delete" @click="deleteLocation(row)"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== Modal: إضافة كتاب (Wizard) ===== -->
    <div v-if="showAddBook" class="modal-overlay" @click.self="showAddBook = false">
      <div class="modal wizard-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-magic"></i> 
            إضافة كتاب جديد - الخطوة {{ wizardStep }} من 4
          </h3>
          <button class="modal-close" @click="showAddBook = false"><i class="fas fa-times"></i></button>
        </div>

        <div class="wizard-progress">
          <div :class="['step-dot', wizardStep >= 1 ? 'active' : '']">1</div>
          <div class="step-line"></div>
          <div :class="['step-dot', wizardStep >= 2 ? 'active' : '']">2</div>
          <div class="step-line"></div>
          <div :class="['step-dot', wizardStep >= 3 ? 'active' : '']">3</div>
          <div class="step-line"></div>
          <div :class="['step-dot', wizardStep >= 4 ? 'active' : '']">4</div>
        </div>

        <div class="modal-body">
          <!-- Step 1: المعلومات الأساسية -->
          <div v-if="wizardStep === 1" class="wizard-content">
            <h4><i class="fas fa-info-circle"></i> المعلومات الأساسية</h4>
            <div class="form-group full">
              <label>عنوان الكتاب *</label>
              <input v-model="newBook.title" type="text" placeholder="مثلاً: الذكاء الاصطناعي" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ISBN *</label>
                <input v-model="newBook.isbn" type="text" placeholder="978-..." />
              </div>
              <div class="form-group">
                <label>اللغة</label>
                <select v-model="newBook.language">
                  <option value="Arabic">العربية</option>
                  <option value="English">الإنجليزية</option>
                  <option value="French">الفرنسية</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>سنة النشر</label>
              <input v-model="newBook.publish_year" type="number" />
            </div>
          </div>

          <!-- Step 2: التصنيف والناشر -->
          <div v-if="wizardStep === 2" class="wizard-content">
            <h4><i class="fas fa-tags"></i> التصنيف والناشر</h4>
            <div class="form-row">
              <div class="form-group">
                <label>التصنيف *</label>
                <select v-model="newBook.category_id">
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <div class="quick-add-bar">
                  <input v-model="quickCategoryName" type="text" placeholder="تصنيف غير موجود؟ أدخل الاسم" />
                  <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addCategoryQuick">إضافة تصنيف</button>
                </div>
              </div>
              <div class="form-group">
                <label>دار النشر *</label>
                <select v-model="newBook.publisher_id">
                  <option v-for="p in publishers" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <div class="quick-add-bar">
                  <input v-model="quickPublisherName" type="text" placeholder="ناشر جديد" />
                  <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addPublisherQuick">إضافة ناشر</button>
                </div>
              </div>
            </div>
            <div class="form-group full">
              <label>صورة الغلاف</label>
              <input type="file" accept="image/*" @change="handleCoverFileChange" />
              <div class="cover-preview" v-if="newBook.cover_image_url">
                <img :src="newBook.cover_image_url" alt="cover preview" />
                <button type="button" class="act-delete" @click="clearCoverImage"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div class="form-group full">
              <label>نبذة مختصرة</label>
              <textarea v-model="newBook.summary" rows="3"></textarea>
            </div>
          </div>

          <!-- Step 3: المؤلف -->
          <div v-if="wizardStep === 3" class="wizard-content">
            <h4><i class="fas fa-pen-nib"></i> اسم المؤلف</h4>
            <div class="form-group full">
              <label>اسم المؤلف الكامل *</label>
              <div class="author-input-wrap">
                <i class="fas fa-user-edit author-input-icon"></i>
                <input
                  v-model="newBook.authorName"
                  type="text"
                  placeholder="مثلاً: محمد أحمد العلي"
                  class="author-text-input"
                />
              </div>
              <p class="help-text">سيتم إضافة المؤلف تلقائياً إلى قاعدة البيانات وربطه بالكتاب</p>
            </div>
          </div>

          <!-- Step 4: النسخ والمواقع -->
          <div v-if="wizardStep === 4" class="wizard-content">
            <h4><i class="fas fa-layer-group"></i> إضافة النسخ المتوفرة</h4>
            <div class="quick-add-bar full-width">
              <input v-model="quickLocation.library_name" type="text" placeholder="اسم المكتبة" />
              <input v-model="quickLocation.floor" type="text" placeholder="الطابق" />
              <input v-model="quickLocation.section" type="text" placeholder="القسم" />
              <input v-model="quickLocation.aisle" type="text" placeholder="الممر" />
              <input v-model="quickLocation.shelf" type="text" placeholder="الرف" />
              <input v-model="quickLocation.position" type="text" placeholder="الموضع" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addLocationQuick">إضافة موقع</button>
            </div>
            <div class="copies-list">
              <div v-for="(copy, idx) in newBook.copies" :key="idx" class="copy-row">
                <div class="form-group">
                  <label>كود النسخة</label>
                  <input v-model="copy.copy_code" type="text" placeholder="C001" />
                </div>
                <div class="form-group">
                  <label>الموقع</label>
                  <select v-model="copy.location_id">
                    <option v-for="l in locations" :key="l.id" :value="l.id">{{ formatLocationLabel(l) }}</option>
                  </select>
                </div>
                <button v-if="newBook.copies.length > 1" class="remove-btn" @click="removeCopyRow(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button class="add-row-btn" @click="addCopyRow">
              <i class="fas fa-plus"></i> إضافة نسخة أخرى
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="wizardStep > 1" class="btn-cancel" @click="wizardStep--">السابق</button>
          <button v-else class="btn-cancel" @click="showAddBook = false">إلغاء</button>
          
          <button v-if="wizardStep < 4" class="btn-save" @click="wizardStep++">التالي <i class="fas fa-arrow-left"></i></button>
          <button v-else class="btn-save" @click="saveBookWizard" :disabled="wizardLoading">
             <i class="fas fa-check-circle"></i> 
             {{ wizardLoading ? 'جاري الحفظ...' : 'إتمام وإضافة الكتاب' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Modal: تعديل كتاب ===== -->
    <div v-if="showEditBook" class="modal-overlay" @click.self="showEditBook = false">
      <div class="modal wizard-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-edit"></i> 
            تعديل بيانات الكتاب - الخطوة {{ editWizardStep }} من 4
          </h3>
          <button class="modal-close" @click="showEditBook = false"><i class="fas fa-times"></i></button>
        </div>

        <div class="wizard-progress">
          <div :class="['step-dot', editWizardStep >= 1 ? 'active' : '']">1</div>
          <div class="step-line"></div>
          <div :class="['step-dot', editWizardStep >= 2 ? 'active' : '']">2</div>
          <div class="step-line"></div>
          <div :class="['step-dot', editWizardStep >= 3 ? 'active' : '']">3</div>
          <div class="step-line"></div>
          <div :class="['step-dot', editWizardStep >= 4 ? 'active' : '']">4</div>
        </div>

        <div class="modal-body">
          <!-- Step 1: المعلومات الأساسية -->
          <div v-if="editWizardStep === 1" class="wizard-content">
            <h4><i class="fas fa-info-circle"></i> المعلومات الأساسية</h4>
            <div class="form-group full">
              <label>عنوان الكتاب *</label>
              <input v-model="editingBook.title" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ISBN</label>
                <input v-model="editingBook.isbn" type="text" />
              </div>
              <div class="form-group">
                <label>اللغة</label>
                <select v-model="editingBook.language">
                  <option value="Arabic">العربية</option>
                  <option value="English">الإنجليزية</option>
                  <option value="French">الفرنسية</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>سنة النشر</label>
              <input v-model="editingBook.publish_year" type="number" />
            </div>
          </div>

          <!-- Step 2: التصنيف والناشر -->
          <div v-if="editWizardStep === 2" class="wizard-content">
            <h4><i class="fas fa-tags"></i> التصنيف والناشر</h4>
            <div class="form-row">
              <div class="form-group">
                <label>التصنيف *</label>
                <select v-model="editingBook.category_id">
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <div class="quick-add-bar">
                  <input v-model="quickCategoryName" type="text" placeholder="تصنيف غير موجود؟ أدخل الاسم" />
                  <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addCategoryQuick(true)">إضافة تصنيف</button>
                </div>
              </div>
              <div class="form-group">
                <label>دار النشر *</label>
                <select v-model="editingBook.publisher_id">
                  <option v-for="p in publishers" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <div class="quick-add-bar">
                  <input v-model="quickPublisherName" type="text" placeholder="ناشر جديد" />
                  <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addPublisherQuick(true)">إضافة ناشر</button>
                </div>
              </div>
            </div>
            <div class="form-group full">
              <label>صورة الغلاف</label>
              <input type="file" accept="image/*" @change="handleEditCoverFileChange" />
              <div class="cover-preview" v-if="editingBook.cover_image_url">
                <img :src="editingBook.cover_image_url.startsWith('/') ? 'http://127.0.0.1:5000' + editingBook.cover_image_url : editingBook.cover_image_url" alt="cover preview" />
                <button type="button" class="act-delete" @click="editingBook.cover_image_url = ''"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div class="form-group full">
              <label>نبذة مختصرة</label>
              <textarea v-model="editingBook.summary" rows="3"></textarea>
            </div>
          </div>

          <!-- Step 3: المؤلف -->
          <div v-if="editWizardStep === 3" class="wizard-content">
            <h4><i class="fas fa-pen-nib"></i> اسم المؤلف</h4>
            <div class="form-group full">
              <label>اسم المؤلف الكامل *</label>
              <div class="author-input-wrap">
                <i class="fas fa-user-edit author-input-icon"></i>
                <input
                  v-model="editingBook.authorName"
                  type="text"
                  placeholder="مثلاً: محمد أحمد العلي"
                  class="author-text-input"
                />
              </div>
              <p class="help-text">سيتم إضافة المؤلف أو استخدام الموجود وربطه بالكتاب</p>
            </div>
          </div>

          <!-- Step 4: النسخ والمواقع -->
          <div v-if="editWizardStep === 4" class="wizard-content">
            <h4><i class="fas fa-layer-group"></i> تعديل النسخ المتوفرة</h4>
            <div class="quick-add-bar full-width">
              <input v-model="quickLocation.library_name" type="text" placeholder="اسم المكتبة" />
              <input v-model="quickLocation.floor" type="text" placeholder="الطابق" />
              <input v-model="quickLocation.section" type="text" placeholder="القسم" />
              <input v-model="quickLocation.aisle" type="text" placeholder="الممر" />
              <input v-model="quickLocation.shelf" type="text" placeholder="الرف" />
              <input v-model="quickLocation.position" type="text" placeholder="الموضع" />
              <button type="button" class="btn-quick-add" :disabled="quickAddBusy" @click="addLocationQuick(true)">إضافة موقع</button>
            </div>
            <div class="copies-list">
              <div v-for="(copy, idx) in editingBook.copies" :key="idx" class="copy-row">
                <div class="form-group">
                  <label>كود النسخة</label>
                  <input v-model="copy.copy_code" type="text" placeholder="C001" />
                </div>
                <div class="form-group">
                  <label>الموقع</label>
                  <select v-model="copy.location_id">
                    <option v-for="l in locations" :key="l.id" :value="l.id">{{ formatLocationLabel(l) }}</option>
                  </select>
                </div>
                <button v-if="editingBook.copies.length > 1" class="remove-btn" @click="removeEditCopyRow(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button class="add-row-btn" @click="addEditCopyRow">
              <i class="fas fa-plus"></i> إضافة نسخة أخرى
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="editWizardStep > 1" class="btn-cancel" @click="editWizardStep--">السابق</button>
          <button v-else class="btn-cancel" @click="showEditBook = false">إلغاء</button>
          
          <button v-if="editWizardStep < 4" class="btn-save" @click="editWizardStep++">التالي <i class="fas fa-arrow-left"></i></button>
          <button v-else class="btn-save" @click="saveEditBook" :disabled="editBookLoading">
            <i class="fas fa-save"></i>
            {{ editBookLoading ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Modal: تسجيل استعارة ===== -->
    <!-- ===== Modal: تسجيل استعارة جديدة ===== -->
    <div v-if="showNewLoan" class="modal-overlay" @click.self="showNewLoan = false">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-exchange-alt"></i> تسجيل استعارة جديدة</h3>
          <button class="modal-close" @click="showNewLoan = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group full relative-parent">
            <label>الطالب / المستخدم *</label>
            <div class="search-select-wrap">
              <input 
                v-model="userSearchInModal" 
                type="text" 
                placeholder="ابحث باسم الطالب أو رقمه الجامعي..." 
                class="search-input"
                @focus="showUserDropdown = true"
              />
              <div v-if="showUserDropdown && !selectedUserInModal" class="search-results-dropdown">
                <div 
                  v-for="u in filteredUsersForModal" 
                  :key="u.id" 
                  class="search-result-item"
                  @click="selectUserForModal(u)"
                >
                  <div class="fw-bold">{{ u.full_name }}</div>
                  <div class="text-small text-muted">{{ u.university_number }}</div>
                </div>
                <div v-if="filteredUsersForModal.length === 0" class="search-no-results">لا يوجد نتائج</div>
              </div>
              <div v-if="selectedUserInModal" class="selected-item-tag">
                <span><i class="fas fa-user"></i> {{ selectedUserInModal.full_name }} ({{ selectedUserInModal.university_number }})</span>
                <button class="remove-tag" @click="selectedUserInModal = null; showUserDropdown = true"><i class="fas fa-times"></i></button>
              </div>
            </div>
          </div>

          <div class="form-group full relative-parent">
            <label>الكتاب *</label>
            <div class="search-select-wrap">
              <input 
                v-model="bookSearchInModal" 
                type="text" 
                placeholder="ابحث باسم الكتاب..." 
                class="search-input"
                @focus="showBookDropdown = true"
              />
              <div v-if="showBookDropdown && !selectedBookInModal" class="search-results-dropdown">
                <div 
                  v-for="b in filteredBooksForModal" 
                  :key="b.id" 
                  class="search-result-item"
                  @click="selectBookForModal(b)"
                >
                  <div class="fw-bold">{{ b.title }}</div>
                  <div class="text-small" :class="isBookAvailable(b) ? 'text-green' : 'text-red'">
                    {{ isBookAvailable(b) ? 'متوفر' : 'غير متوفر حالياً' }}
                  </div>
                </div>
                <div v-if="filteredBooksForModal.length === 0" class="search-no-results">لا يوجد نتائج</div>
              </div>
              <div v-if="selectedBookInModal" class="selected-item-tag">
                <span><i class="fas fa-book"></i> {{ selectedBookInModal.title }}</span>
                <button class="remove-tag" @click="selectedBookInModal = null; showBookDropdown = true"><i class="fas fa-times"></i></button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>تاريخ الاستعارة</label>
              <input :value="today" type="text" disabled class="disabled-input" />
            </div>
            <div class="form-group">
              <label>موعد الإرجاع (تلقائي)</label>
              <input :value="calculatedDueDate" type="text" disabled class="disabled-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showNewLoan = false">إلغاء</button>
          <button 
            class="btn-save" 
            :disabled="!selectedUserInModal || !selectedBookInModal || !isBookAvailable(selectedBookInModal)" 
            @click="saveLoan"
          >
            <i class="fas fa-save"></i> تسجيل الاستعارة
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Modal: تفاصيل الاستعارة ===== -->
    <div v-if="showLoanDetails" class="modal-overlay" @click.self="showLoanDetails = false">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-info-circle"></i> تفاصيل الاستعارة</h3>
          <button class="modal-close" @click="showLoanDetails = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" v-if="selectedLoan">
          <div class="details-section" style="margin-bottom: 20px;">
            <h4 style="color: #3498db; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;"><i class="fas fa-user"></i> معلومات المستخدم</h4>
            <p><strong>الاسم:</strong> {{ selectedLoan.user?.full_name }}</p>
            <p><strong>البريد:</strong> {{ selectedLoan.user?.email }}</p>
            <p><strong>الرقم الجامعي:</strong> {{ selectedLoan.user?.university_number }}</p>
            <p><strong>الهاتف:</strong> {{ selectedLoan.user?.phone || 'غير متوفر' }}</p>
          </div>
          <div class="details-section">
            <h4 style="color: #3498db; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;"><i class="fas fa-book"></i> معلومات الاستعارة</h4>
            <p><strong>الكتاب:</strong> {{ selectedLoan.book?.title }}</p>
            <p><strong>كود النسخة:</strong> {{ selectedLoan.copy?.copy_code }}</p>
            <p><strong>تاريخ الاستعارة:</strong> {{ selectedLoan.borrow_date }}</p>
            <p><strong>موعد الإرجاع:</strong> <span :class="selectedLoan.status === 'OVERDUE' ? 'text-red fw-bold' : ''">{{ selectedLoan.due_date }}</span></p>
            <p><strong>الحالة:</strong> {{ selectedLoan.status === 'RETURNED' ? 'مُرجَعة' : (selectedLoan.status === 'OVERDUE' ? `متأخر (${selectedLoan.overdue_days} أيام)` : 'نشطة') }}</p>
            <p v-if="selectedLoan.fine_amount > 0"><strong>إجمالي الغرامات:</strong> <span class="text-red">{{ selectedLoan.fine_amount }} ل.س</span></p>
          </div>
          <div class="details-section" style="margin-top: 15px;">
            <h4 style="color: #e74c3c; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;"><i class="fas fa-coins"></i> فرض غرامة جديدة</h4>
            <div class="form-row">
              <div class="form-group">
                <label>السبب</label>
                <select v-model="newFine.fine_type">
                  <option value="OVERDUE">تأخير</option>
                  <option value="DAMAGE">تلف</option>
                  <option value="LOST">ضياع</option>
                </select>
              </div>
              <div class="form-group">
                <label>المبلغ (ل.س)</label>
                <input v-model="newFine.amount" type="number" placeholder="المبلغ..." />
              </div>
            </div>
            <button class="btn-save" style="margin-top: 10px; width: 100%;" @click="submitFine" :disabled="submittingFine">
              <i class="fas fa-plus"></i> {{ submittingFine ? 'جاري الفرض...' : 'فرض الغرامة' }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLoanDetails = false">إغلاق</button>
        </div>
      </div>
    </div>
    <!-- ===== Modal: إضافة مستخدم ===== -->
    <div v-if="showAddUser" class="modal-overlay" @click.self="showAddUser = false">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus"></i> إضافة مستخدم جديد</h3>
          <button class="modal-close" @click="showAddUser = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <!-- اختيار الدور -->
          <div class="form-group full">
            <label>نوع الحساب *</label>
            <div class="admin-role-selector">
              <div
                v-for="r in [
                  { value: 'STUDENT',  label: 'طالب',  icon: 'fas fa-user-graduate' },
                  { value: 'FACULTY',  label: 'دكتور', icon: 'fas fa-chalkboard-teacher' },
                  { value: 'EMPLOYEE', label: 'موظف',  icon: 'fas fa-briefcase' }
                ]"
                :key="r.value"
                :class="['admin-role-card', newUserForm.role === r.value ? 'selected' : '']"
                @click="newUserForm.role = r.value"
              >
                <i :class="r.icon"></i>
                <span>{{ r.label }}</span>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full">
              <label>الاسم الكامل *</label>
              <input v-model="newUserForm.fullName" type="text" placeholder="الاسم الثلاثي" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>البريد الإلكتروني *</label>
              <input v-model="newUserForm.email" type="email" placeholder="example@univ.edu.sy" />
            </div>
            <div class="form-group">
              <label>رقم الهاتف</label>
              <input v-model="newUserForm.phone" type="text" placeholder="09..." />
            </div>
          </div>
          <div class="form-row">
            <div v-if="newUserForm.role === 'STUDENT'" class="form-group">
              <label>الرقم الجامعي</label>
              <input v-model="newUserForm.universityNumber" type="text" placeholder="الرقم الجامعي" />
            </div>
            <div v-else class="form-group">
              <label>رقم الهوية <span class="auto-gen-badge"><i class="fas fa-magic"></i> تلقائي</span></label>
              <input
                :value="newUserForm.universityNumber || '(سيُولَّد عند الحفظ)'"
                type="text"
                disabled
                class="auto-gen-input"
              />
            </div>
            <div class="form-group">
              <label>كلمة المرور *</label>
              <input v-model="newUserForm.password" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div v-if="addUserError" class="modal-api-error">
            <i class="fas fa-exclamation-triangle"></i> {{ addUserError }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddUser = false">إلغاء</button>
          <button class="btn-save" @click="saveNewUser" :disabled="addUserLoading">
            <i class="fas fa-user-plus"></i>
            {{ addUserLoading ? 'جاري الإضافة...' : 'إضافة المستخدم' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import { adminService } from '../../api/adminService'
import { bookService } from '../../api/bookService'
import { loanService } from '../../api/loanService'
import { userService } from '../../api/userService'
import { listFromResponse } from '../../api/responseUtils'

export default {
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const activeTab = ref('overview')
    const adminName = computed(() => authStore.userName)
    const today = ref(new Date().toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

    // Modals
    const showAddBook = ref(false)
    const showEditBook = ref(false)
    const showAddUser = ref(false)
    const editBookLoading = ref(false)
    const editWizardStep = ref(1)

    // Toast notification
    const toast = reactive({ visible: false, type: 'success', title: '', message: '' })
    let toastTimer = null
    const showToast = (type, title, message) => {
      if (toastTimer) clearTimeout(toastTimer)
      toast.type = type
      toast.title = title
      toast.message = message
      toast.visible = true
      toastTimer = setTimeout(() => { toast.visible = false }, 5000)
    }

    // New User Form
    const newUserForm = reactive({
      fullName: '',
      email: '',
      phone: '',
      universityNumber: '',
      password: '',
      role: 'STUDENT'
    })
    const addUserLoading = ref(false)
    const addUserError = ref('')

    const editingBook = reactive({
      id: null,
      title: '',
      isbn: '',
      language: 'Arabic',
      publish_year: new Date().getFullYear(),
      summary: '',
      cover_image_url: '',
      publisher_id: null,
      category_id: null,
      authorName: '',
      copies: []
    })
    const showNewLoan = ref(false)
    const showLoanDetails = ref(false)
    const selectedLoan = ref(null)

    const newFine = reactive({
      fine_type: 'OVERDUE',
      amount: ''
    })
    const submittingFine = ref(false)

    const submitFine = async () => {
      if (!newFine.amount || newFine.amount <= 0) {
        alert('يرجى إدخال مبلغ صحيح للغرامة')
        return
      }
      submittingFine.value = true
      try {
        await adminService.createFine({
          loan_id: selectedLoan.value.id,
          user_id: selectedLoan.value.user_id,
          fine_type: newFine.fine_type,
          amount: newFine.amount
        })
        alert('تم فرض الغرامة بنجاح')
        fetchData()
        showLoanDetails.value = false
        newFine.amount = ''
        newFine.fine_type = 'OVERDUE'
      } catch (err) {
        alert('خطأ في فرض الغرامة: ' + (err.response?.data?.message || err.message))
      } finally {
        submittingFine.value = false
      }
    }

    const quickCategoryName = ref('')
    const quickPublisherName = ref('')
    const quickAuthorName = ref('')
    const quickLocation = reactive({
      library_name: '',
      floor: '',
      section: '',
      aisle: '',
      shelf: '',
      position: ''
    })
    const quickAddBusy = ref(false)

    // Wizard State
    const wizardStep = ref(1)
    const wizardLoading = ref(false)

    // Data State
    const stats = reactive({
      totalBooks: 0,
      totalUsers: 0,
      activeLoansCount: 0,
      overdueLoansCount: 0
    })

    const books = ref([])
    const loans = ref([])
    const users = ref([])
    const fines = ref([])
    const categories = ref([])
    const publishers = ref([])
    const authors = ref([])
    const locations = ref([])

    // Filters
    const bookSearch = ref('')
    const bookFilter = ref('all')
    const loanSearch = ref('')
    const loanFilter = ref('all')
    const userSearch = ref('')
    const userFilter = ref('all')
    const categorySearch = ref('')
    const publisherSearch = ref('')
    const authorSearch = ref('')
    const locationSearch = ref('')

    // New Data Objects
    const newBook = reactive({
      title: '',
      isbn: '',
      language: 'Arabic',
      publish_year: new Date().getFullYear(),
      summary: '',
      description: '',
      cover_image_url: '',
      publisher_id: null,
      category_id: null,
      authorName: '',
      copies: [
        { copy_code: '', barcode_value: '', location_id: null }
      ]
    })

    const newLoan = reactive({
      user_id: null,
      book_id: null
    })

    const userSearchInModal = ref('')
    const selectedUserInModal = ref(null)
    const showUserDropdown = ref(false)
    const bookSearchInModal = ref('')
    const selectedBookInModal = ref(null)
    const showBookDropdown = ref(false)

    const filteredUsersForModal = computed(() => {
      const q = userSearchInModal.value.toLowerCase().trim()
      const all = users.value || []
      if (!q) return all.slice(0, 10)
      return all.filter(u => 
        u.full_name.toLowerCase().includes(q) || 
        String(u.university_number).includes(q)
      ).slice(0, 15)
    })

    const filteredBooksForModal = computed(() => {
      const q = bookSearchInModal.value.toLowerCase().trim()
      const all = books.value || []
      if (!q) return all.slice(0, 10)
      return all.filter(b => 
        b.title.toLowerCase().includes(q)
      ).slice(0, 15)
    })

    const selectUserForModal = (user) => {
      selectedUserInModal.value = user
      userSearchInModal.value = ''
      showUserDropdown.value = false
    }

    const selectBookForModal = (book) => {
      selectedBookInModal.value = book
      bookSearchInModal.value = ''
      showBookDropdown.value = false
    }

    const isBookAvailable = (book) => {
      return book?.copies?.some(c => c.status === 'AVAILABLE')
    }

    const calculatedDueDate = computed(() => {
      const d = new Date()
      d.setDate(d.getDate() + 14) // Default 14 days
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
    })

    // Menu Items
    const menuItems = [
      { key: 'overview',   label: 'نظرة عامة',     icon: 'fas fa-chart-pie' },
      { key: 'books',      label: 'إدارة الكتب',   icon: 'fas fa-book' },
      { key: 'categories', label: 'التصنيفات',     icon: 'fas fa-tags' },
      { key: 'publishers', label: 'الناشرون',      icon: 'fas fa-building' },
      { key: 'locations',  label: 'المواقع',       icon: 'fas fa-map-marker-alt' },
      { key: 'loans',      label: 'الاستعارات',    icon: 'fas fa-exchange-alt' },
      { key: 'users',      label: 'المستخدمون',    icon: 'fas fa-users' },
      { key: 'fines',      label: 'الغرامات',      icon: 'fas fa-coins' },
    ]

    const refreshBookLookups = async () => {
      const [catsRes, pubsRes, authsRes, locsRes] = await Promise.all([
        bookService.getCategories(),
        bookService.getPublishers(),
        bookService.getAuthors(),
        bookService.getLocations()
      ])
      categories.value = listFromResponse(catsRes)
      publishers.value = listFromResponse(pubsRes)
      authors.value = listFromResponse(authsRes)
      locations.value = listFromResponse(locsRes)
    }

    /** إحصائيات «نظرة عامة» تُحسب من نفس البيانات المجلوبة (لا حاجة لـ /admin/stats) */
    const recomputeStats = () => {
      const loanList = loans.value || []
      const userList = users.value || []
      stats.totalBooks = (books.value || []).length
      // يشمل الجميع عدا librarian و admin
      stats.totalUsers = userList.filter(u => {
        const role = String(u.role?.name || u.role || '').toUpperCase()
        return role !== 'LIBRARIAN' && role !== 'ADMIN'
      }).length
      stats.activeLoansCount = loanList.filter(l => l.status === 'ACTIVE').length
      stats.overdueLoansCount = loanList.filter(l => l.status === 'OVERDUE').length
    }

    const fetchData = async () => {
      try {
        const listParams = { per_page: 500, page: 1 }

        const booksRes = await bookService.getBooks(listParams)
        books.value = listFromResponse(booksRes)

        const loansRes = await loanService.getLoans(listParams)
        const now = new Date()
        const formatDate = (dateString) => {
          if (!dateString) return '—'
          return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
        }
        loans.value = listFromResponse(loansRes).map(r => {
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
            borrow_date: formatDate(r.loaned_at),
            due_date: formatDate(r.due_at),
            fine_amount: r.fine_amount || 0
          }
        })

        const usersRes = await userService.getUsers(listParams)
        users.value = listFromResponse(usersRes)

        const finesRes = await adminService.getFines(listParams)
        fines.value = listFromResponse(finesRes)

        recomputeStats()
        await refreshBookLookups()
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      }
    }

    onMounted(fetchData)

    // Watch for tab changes to refresh specific data
    watch(activeTab, (newTab) => {
      if (newTab === 'overview') fetchData()
    })

    // Computed Filters
    const filteredAdminBooks = computed(() => {
      return (books.value || []).filter(b => {
        const matchSearch = !bookSearch.value || b.title.includes(bookSearch.value) || (b.authors && b.authors.some(a => a.full_name.includes(bookSearch.value)))
        const matchFilter = bookFilter.value === 'all' || 
          (bookFilter.value === 'available' && b.copies && b.copies.some(c => c.status === 'AVAILABLE')) ||
          (bookFilter.value === 'unavailable' && b.copies && b.copies.every(c => c.status !== 'AVAILABLE'))
        return matchSearch && matchFilter
      })
    })

    const filteredLoans = computed(() => {
      return (loans.value || []).filter(l => {
        const userName = l.user?.full_name || ''
        const bookTitle = l.book?.title || ''
        const matchSearch = !loanSearch.value || userName.includes(loanSearch.value) || bookTitle.includes(loanSearch.value)
        const matchFilter = loanFilter.value === 'all' || l.status === loanFilter.value
        return matchSearch && matchFilter
      })
    })

    const filteredUsers = computed(() => {
      return (users.value || []).filter(u => {
        const matchSearch = !userSearch.value || u.full_name.includes(userSearch.value) || u.email.includes(userSearch.value)
        const roleKey = (u.role && (u.role.name || u.role)) || ''
        const matchFilter = userFilter.value === 'all' || String(roleKey).toUpperCase() === userFilter.value.toUpperCase()
        return matchSearch && matchFilter
      })
    })

    const filteredCategories = computed(() => {
      const q = categorySearch.value.trim()
      return (categories.value || []).filter(c => !q || String(c.name || '').includes(q))
    })
    const filteredPublishers = computed(() => {
      const q = publisherSearch.value.trim()
      return (publishers.value || []).filter(p => !q || String(p.name || '').includes(q))
    })
    const filteredAuthors = computed(() => {
      const q = authorSearch.value.trim()
      return (authors.value || []).filter(a => !q || String(a.full_name || '').includes(q))
    })
    const formatLocationLabel = (loc) => {
      const parts = [
        loc?.library_name,
        `طابق ${loc?.floor || ''}`.trim(),
        `قسم ${loc?.section || ''}`.trim(),
        `ممر ${loc?.aisle || ''}`.trim(),
        `رف ${loc?.shelf || ''}`.trim(),
        `موضع ${loc?.position || ''}`.trim()
      ].filter(Boolean)
      return parts.join(' | ')
    }

    const filteredLocations = computed(() => {
      const q = locationSearch.value.trim()
      return (locations.value || []).filter(l => {
        if (!q) return true
        return formatLocationLabel(l).includes(q)
      })
    })

    const totalPendingFines = computed(() => {
      return (fines.value || []).filter(f => f.status === 'UNPAID').reduce((s, f) => s + f.amount, 0).toLocaleString('ar')
    })

    const recentLoans = computed(() => {
      return (loans.value || []).slice(0, 5)
    })

    // Actions
    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    const buildCreateBookPayload = async () => {
      // إنشاء المؤلف وربطه بالكتاب
      let authorsPayload = []
      if (newBook.authorName && newBook.authorName.trim()) {
        try {
          const res = await bookService.createAuthor({ full_name: newBook.authorName.trim() })
          const created = res.data.data || res.data
          if (created?.id) authorsPayload = [{ id: created.id }]
        } catch (err) {
          // قد يكون موجوداً مسبقاً - نحاول الجلب
          try {
            await refreshBookLookups()
            const found = authors.value.find(a => a.full_name === newBook.authorName.trim())
            if (found) authorsPayload = [{ id: found.id }]
          } catch (_) {}
        }
      }

      const copiesPayload = (newBook.copies || []).map((c) => ({
        copy_code: c.copy_code,
        barcode_value: c.barcode_value || '',
        location_id: c.location_id
      }))

      return {
        title: newBook.title,
        isbn: newBook.isbn,
        language: newBook.language,
        publish_year: newBook.publish_year,
        summary: newBook.summary,
        description: newBook.description,
        cover_image_url: newBook.cover_image_url,
        publisher_id: newBook.publisher_id,
        category_id: newBook.category_id,
        authors: authorsPayload,
        copies: copiesPayload
      }
    }

    const saveBookWizard = async () => {
      wizardLoading.value = true
      try {
        const payload = await buildCreateBookPayload()
        await bookService.createFullBook(payload)
        showToast('success', 'تم إضافة الكتاب', `تم حفظ "${newBook.title}" بنجاح`)
        showAddBook.value = false
        fetchData()
        Object.assign(newBook, {
          title: '', isbn: '', language: 'Arabic', publish_year: new Date().getFullYear(),
          summary: '', description: '', cover_image_url: '', publisher_id: null,
          category_id: null, authorName: '', copies: [{ copy_code: '', barcode_value: '', location_id: null }]
        })
        wizardStep.value = 1
      } catch (err) {
        alert('خطأ في حفظ الكتاب: ' + (err.response?.data?.message || err.message))
      } finally {
        wizardLoading.value = false
      }
    }

    const deleteBook = async (book) => {
      if (confirm(`هل تريد حذف: ${book.title}؟`)) {
        try {
          await bookService.deleteBook(book.id)
          fetchData()
        } catch (err) {
          alert('فشل الحذف')
        }
      }
    }

    const returnBookAction = async (loan) => {
      try {
        await loanService.returnBook(loan.id)
        const bookTitle = loan.book?.title || 'الكتاب'
        const userName = loan.user?.full_name || 'المستخدم'
        showToast('success', 'تم ارجاع الكتاب ', `"${bookTitle}" من ${userName}`)
        fetchData()
      } catch (err) {
        showToast('error', 'فشل الإرجاع', err.response?.data?.message || err.message)
      }
    }

    const toggleUserStatus = async (user) => {
      const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      try {
        await userService.toggleStatus(user.id, newStatus)
        fetchData()
      } catch (err) {
        alert('فشل تغيير حالة المستخدم')
      }
    }

    const markFinePaid = async (fine) => {
      try {
        await adminService.payFine(fine.id)
        alert('تم تأكيد الدفع')
        fetchData()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل التحديث')
      }
    }

    const confirmUserDeposit = async (userRow) => {
      const amount = Number(userRow.deposit?.amount) || 500
      if (!confirm(`تأكيد استلام إيداع بقيمة ${amount} للمستخدم ${userRow.full_name}؟`)) return
      try {
        await adminService.confirmDeposit({ user_id: userRow.id, amount })
        alert('تم تأكيد الإيداع')
        fetchData()
      } catch (err) {
        alert(err.response?.message || 'فشل تأكيد الإيداع')
      }
    }

    const addCategoryQuick = async (isEdit = false) => {
      const name = quickCategoryName.value.trim()
      if (!name) return
      quickAddBusy.value = true
      try {
        const res = await bookService.createCategory({ name })
        const created = res.data.data
        await refreshBookLookups()
        if (created?.id) {
          if (isEdit === true) editingBook.category_id = created.id
          else newBook.category_id = created.id
        }
        quickCategoryName.value = ''
        alert('تمت إضافة التصنيف')
      } catch (err) {
        alert(err.response?.data?.message || 'فشل إضافة التصنيف')
      } finally {
        quickAddBusy.value = false
      }
    }

    const addPublisherQuick = async (isEdit = false) => {
      const name = quickPublisherName.value.trim()
      if (!name) return
      quickAddBusy.value = true
      try {
        const res = await bookService.createPublisher({ name })
        const created = res.data.data
        await refreshBookLookups()
        if (created?.id) {
          if (isEdit === true) editingBook.publisher_id = created.id
          else newBook.publisher_id = created.id
        }
        quickPublisherName.value = ''
        alert('تمت إضافة دار النشر')
      } catch (err) {
        alert(err.response?.data?.message || 'فشل إضافة الناشر')
      } finally {
        quickAddBusy.value = false
      }
    }

    const addAuthorQuick = async (isEdit = false) => {
      const full_name = quickAuthorName.value.trim()
      if (!full_name) return
      quickAddBusy.value = true
      try {
        const res = await bookService.createAuthor({ full_name })
        const created = res.data.data
        await refreshBookLookups()
        if (created?.id) {
          if (isEdit === true && !editingBook.authors.includes(created.id)) {
            editingBook.authors.push(created.id)
          } else if (isEdit !== true && !newBook.authors.includes(created.id)) {
            newBook.authors.push(created.id)
          }
        }
        quickAuthorName.value = ''
        alert('تمت إضافة المؤلف وتم تحديده للكتاب')
      } catch (err) {
        alert(err.response?.data?.message || 'فشل إضافة المؤلف')
      } finally {
        quickAddBusy.value = false
      }
    }

    const addLocationQuick = async (isEdit = false) => {
      const payload = {
        library_name: quickLocation.library_name.trim(),
        floor: quickLocation.floor.trim(),
        section: quickLocation.section.trim(),
        aisle: quickLocation.aisle.trim(),
        shelf: quickLocation.shelf.trim(),
        position: quickLocation.position.trim()
      }
      if (!payload.library_name || !payload.floor || !payload.section || !payload.aisle || !payload.shelf || !payload.position) {
        alert('يرجى إدخال جميع حقول الموقع')
        return
      }
      quickAddBusy.value = true
      try {
        const res = await bookService.createLocation(payload)
        const created = res.data.data
        await refreshBookLookups()
        if (created?.id) {
          if (isEdit === true && editingBook.copies.length) {
            editingBook.copies[editingBook.copies.length - 1].location_id = created.id
          } else if (isEdit !== true && newBook.copies.length) {
            newBook.copies[newBook.copies.length - 1].location_id = created.id
          }
        }
        quickLocation.library_name = ''
        quickLocation.floor = ''
        quickLocation.section = ''
        quickLocation.aisle = ''
        quickLocation.shelf = ''
        quickLocation.position = ''
        alert('تمت إضافة الموقع وربطه بآخر صف نسخة')
      } catch (err) {
        alert(err.response?.data?.message || 'فشل إضافة الموقع — تحقق من الحقول المطلوبة في الـ API')
      } finally {
        quickAddBusy.value = false
      }
    }

    const handleCoverFileChange = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        newBook.cover_image_url = String(reader.result || '')
      }
      reader.readAsDataURL(file)
    }

    const clearCoverImage = () => {
      newBook.cover_image_url = ''
    }

    const editCategory = async (row) => {
      const name = prompt('اسم التصنيف الجديد', row.name || '')
      if (!name || name === row.name) return
      try {
        await bookService.updateCategory(row.id, { name })
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل تعديل التصنيف')
      }
    }
    const deleteCategory = async (row) => {
      if (!confirm(`حذف التصنيف "${row.name}"؟`)) return
      try {
        await bookService.deleteCategory(row.id)
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل حذف التصنيف')
      }
    }
    const editPublisher = async (row) => {
      const name = prompt('اسم الناشر الجديد', row.name || '')
      if (!name || name === row.name) return
      try {
        await bookService.updatePublisher(row.id, { name })
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل تعديل الناشر')
      }
    }
    const deletePublisher = async (row) => {
      if (!confirm(`حذف الناشر "${row.name}"؟`)) return
      try {
        await bookService.deletePublisher(row.id)
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل حذف الناشر')
      }
    }
    const editAuthor = async (row) => {
      const full_name = prompt('اسم المؤلف الجديد', row.full_name || '')
      if (!full_name || full_name === row.full_name) return
      try {
        await bookService.updateAuthor(row.id, { full_name })
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل تعديل المؤلف')
      }
    }
    const deleteAuthor = async (row) => {
      if (!confirm(`حذف المؤلف "${row.full_name}"؟`)) return
      try {
        await bookService.deleteAuthor(row.id)
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل حذف المؤلف')
      }
    }
    const editLocation = async (row) => {
      const library_name = prompt('اسم المكتبة', row.library_name || '')
      if (!library_name) return
      const floor = prompt('الطابق', row.floor || '')
      if (!floor) return
      const section = prompt('القسم', row.section || '')
      if (!section) return
      const aisle = prompt('الممر', row.aisle || '')
      if (!aisle) return
      const shelf = prompt('الرف', row.shelf || '')
      if (!shelf) return
      const position = prompt('الموضع', row.position || '')
      if (!position) return
      try {
        await bookService.updateLocation(row.id, { library_name, floor, section, aisle, shelf, position })
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل تعديل الموقع')
      }
    }
    const deleteLocation = async (row) => {
      if (!confirm(`حذف الموقع "${formatLocationLabel(row)}"؟`)) return
      try {
        await bookService.deleteLocation(row.id)
        await refreshBookLookups()
      } catch (err) {
        alert(err.response?.data?.message || 'فشل حذف الموقع')
      }
    }

    const editBook = (book) => {
      editingBook.id = book.id
      editingBook.title = book.title || ''
      editingBook.isbn = book.isbn || ''
      editingBook.language = book.language || 'Arabic'
      editingBook.publish_year = book.publish_year || new Date().getFullYear()
      editingBook.summary = book.summary || ''
      editingBook.cover_image_url = book.cover_image_url || ''
      editingBook.publisher_id = book.publisher?.id || book.publisher_id || null
      editingBook.category_id = book.category?.id || book.category_id || null
      // تعبئة اسم المؤلف من أول مؤلف
      editingBook.authorName = (book.authors && book.authors.length > 0) ? book.authors[0].full_name : ''
      editingBook.copies = (book.copies || []).map(c => ({
        id: c.id,
        copy_code: c.copy_code,
        barcode_value: c.barcode_value || '',
        location_id: c.location?.id || c.location_id || null
      }))
      if (editingBook.copies.length === 0) {
        editingBook.copies.push({ copy_code: '', barcode_value: '', location_id: null })
      }
      editWizardStep.value = 1
      showEditBook.value = true
    }

    const saveEditBook = async () => {
      editBookLoading.value = true
      try {
        // إنشاء المؤلف وربطه
        let authorsPayload = []
        if (editingBook.authorName && editingBook.authorName.trim()) {
          try {
            const res = await bookService.createAuthor({ full_name: editingBook.authorName.trim() })
            const created = res.data.data || res.data
            if (created?.id) authorsPayload = [{ id: created.id }]
          } catch (err) {
            await refreshBookLookups()
            const found = authors.value.find(a => a.full_name === editingBook.authorName.trim())
            if (found) authorsPayload = [{ id: found.id }]
          }
        }

        const copiesPayload = (editingBook.copies || []).map(c => ({
          id: c.id,
          copy_code: c.copy_code,
          barcode_value: c.barcode_value || '',
          location_id: c.location_id
        }))

        const payload = {
          title: editingBook.title,
          isbn: editingBook.isbn,
          language: editingBook.language,
          publish_year: editingBook.publish_year,
          summary: editingBook.summary,
          cover_image_url: editingBook.cover_image_url,
          publisher_id: editingBook.publisher_id,
          category_id: editingBook.category_id,
          authors: authorsPayload,
          copies: copiesPayload
        }
        await bookService.updateBook(editingBook.id, payload)
        showToast('success', 'تم تعديل الكتاب', `تم تحديث "${editingBook.title}" بنجاح`)
        showEditBook.value = false
        fetchData()
      } catch (err) {
        alert('خطأ في تعديل الكتاب: ' + (err.response?.data?.message || err.message))
      } finally {
        editBookLoading.value = false
      }
    }

    const handleEditCoverFileChange = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        editingBook.cover_image_url = String(reader.result || '')
      }
      reader.readAsDataURL(file)
    }

    const editUser = () => {
      alert('تعديل المستخدم من الواجهة غير مفعّل حالياً.')
    }

    const openAddUserStub = () => {
      showAddUser.value = true
    }

    const saveNewUser = async () => {
      if (!newUserForm.fullName || !newUserForm.email || !newUserForm.password) {
        addUserError.value = 'يرجى ملء جميع الحقول المطلوبة'
        return
      }
      addUserLoading.value = true
      addUserError.value = ''
      try {
        const { authService } = await import('../../api/authService')
        // توليد رقم هوية تلقائي للموظف/الدكتور
        let uniNum = newUserForm.universityNumber
        if (newUserForm.role !== 'STUDENT' && !uniNum) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
          const prefix = newUserForm.role === 'FACULTY' ? 'FAC' : 'EMP'
          uniNum = prefix + '-' + Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        }
        await authService.register({
          fullName: newUserForm.fullName,
          email: newUserForm.email,
          phone: newUserForm.phone,
          universityNumber: uniNum,
          password: newUserForm.password,
          role: newUserForm.role
        })
        showToast('success', 'تم إضافة المستخدم', `تم إنشاء حساب ${newUserForm.fullName} بنجاح`)
        showAddUser.value = false
        Object.assign(newUserForm, { fullName: '', email: '', phone: '', universityNumber: '', password: '', role: 'STUDENT' })
        fetchData()
      } catch (err) {
        addUserError.value = err.response?.data?.message || 'فشل إضافة المستخدم'
      } finally {
        addUserLoading.value = false
      }
    }

    const saveLoan = async () => {
      if (!selectedUserInModal.value || !selectedBookInModal.value) return
      
      try {
        await loanService.borrowBook(selectedBookInModal.value.id, selectedUserInModal.value.id)
        alert('تم تسجيل الاستعارة بنجاح')
        showNewLoan.value = false
        // Reset
        selectedUserInModal.value = null
        selectedBookInModal.value = null
        userSearchInModal.value = ''
        bookSearchInModal.value = ''
        fetchData()
      } catch (err) {
        alert('خطأ في تسجيل الاستعارة: ' + (err.response?.data?.message || err.message))
      }
    }

    const viewLoan = (loan) => {
      selectedLoan.value = loan
      showLoanDetails.value = true
    }

    const addCopyRow = () => {
      newBook.copies.push({ copy_code: '', barcode_value: '', location_id: null })
    }

    const removeCopyRow = (index) => {
      newBook.copies.splice(index, 1)
    }

    const addEditCopyRow = () => {
      editingBook.copies.push({ copy_code: '', barcode_value: '', location_id: null })
    }

    const removeEditCopyRow = (index) => {
      editingBook.copies.splice(index, 1)
    }

    return {
      activeTab, adminName, today, showAddBook, showNewLoan, showEditBook, showLoanDetails, selectedLoan,
      showAddUser, newUserForm, addUserLoading, addUserError, saveNewUser, openAddUserStub,
      wizardStep, wizardLoading, editBookLoading, editingBook, editWizardStep,
      stats, books, loans, users, fines,
      categories, publishers, authors, locations,
      bookSearch, bookFilter, loanSearch, loanFilter, userSearch, userFilter,
      categorySearch, publisherSearch, authorSearch, locationSearch,
      newBook, newLoan, menuItems, logout,
      quickCategoryName, quickPublisherName, quickAuthorName, quickLocation, quickAddBusy,
      filteredAdminBooks, filteredLoans, filteredUsers, totalPendingFines, recentLoans,
      filteredCategories, filteredPublishers, filteredAuthors, filteredLocations,
      saveBookWizard, deleteBook, returnBookAction, toggleUserStatus, markFinePaid,
      confirmUserDeposit, addCategoryQuick, addPublisherQuick, addAuthorQuick, addLocationQuick,
      handleCoverFileChange, clearCoverImage, handleEditCoverFileChange,
      editCategory, deleteCategory, editPublisher, deletePublisher, editAuthor, deleteAuthor, editLocation, deleteLocation,
      formatLocationLabel,
      editBook, saveEditBook, editUser, saveLoan, viewLoan,
      addCopyRow, removeCopyRow, addEditCopyRow, removeEditCopyRow, fetchData,
      newFine, submittingFine, submitFine,
      userSearchInModal, selectedUserInModal, showUserDropdown,
      bookSearchInModal, selectedBookInModal, showBookDropdown,
      filteredUsersForModal, filteredBooksForModal,
      selectUserForModal, selectBookForModal, isBookAvailable, calculatedDueDate,
      toast, showToast
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
.navbar { display: flex; justify-content: space-between; align-items: center; background: #1a2940; padding: 0 25px; height: 65px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
.nav-brand { color: white; font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.nav-brand i { color: #3498db; font-size: 1.2rem; }
.admin-badge { background: rgba(52,152,219,0.15); border: 1px solid rgba(52,152,219,0.3); color: #5dade2; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.nav-links { display: flex; align-items: center; gap: 12px; }
.nav-user { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.8); font-size: 0.88rem; }
.user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #1a5276, #2e86c1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.85rem; }
.logout-btn { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); padding: 7px 14px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.logout-btn:hover { background: #e74c3c; color: white; }

/* LAYOUT */
.main-layout { display: flex; min-height: calc(100vh - 65px); }

/* SIDEBAR */
.sidebar { width: 230px; min-width: 230px; background: #1e3a5f; padding: 20px 12px; }
.sidebar-menu { list-style: none; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; cursor: pointer; color: rgba(255,255,255,0.65); font-size: 0.92rem; transition: 0.2s; margin-bottom: 4px; position: relative; }
.menu-item i { width: 18px; text-align: center; font-size: 0.95rem; }
.menu-item span:nth-child(2) { flex: 1; }
.menu-item:hover { background: rgba(255,255,255,0.07); color: white; }
.menu-item.active { background: #3498db; color: white; box-shadow: 0 4px 15px rgba(52,152,219,0.3); }
.menu-badge { background: #e74c3c; color: white; padding: 2px 7px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }

/* CONTENT */
.content-area { flex: 1; padding: 25px; overflow-y: auto; }

/* PAGE HEADER */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #1a2940; display: flex; align-items: center; gap: 10px; }
.page-date { color: #95a5a6; font-size: 0.88rem; }
.header-stat-pill { background: white; border: 1px solid #edf0f3; padding: 10px 18px; border-radius: 10px; font-size: 0.9rem; color: #2c3e50; }
.header-stat-pill strong { color: #e74c3c; }

/* STATS GRID */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; box-shadow: 0 2px 15px rgba(0,0,0,0.05); border: 1px solid #edf0f3; transition: 0.25s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0,0,0,0.08); }
.stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.stat-card.blue .stat-icon { background: #eaf4fd; color: #2e86c1; }
.stat-card.green .stat-icon { background: #eafaf1; color: #27ae60; }
.stat-card.orange .stat-icon { background: #fef9e7; color: #d68910; }
.stat-card.red .stat-icon { background: #fdf0f0; color: #e74c3c; }
.stat-info { flex: 1; }
.stat-num { display: block; font-size: 1.7rem; font-weight: 800; color: #1a2940; line-height: 1; }
.stat-label { font-size: 0.8rem; color: #95a5a6; margin-top: 3px; display: block; }
.stat-trend { width: 100%; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.stat-trend.up { background: #eafaf1; color: #1e8449; }
.stat-trend.down { background: #fdf0f0; color: #c0392b; }
.stat-trend.neutral { background: #f8f9fa; color: #7f8c8d; }

/* SECTION CARD */
.section-card { background: white; border-radius: 16px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); border: 1px solid #edf0f3; overflow: hidden; }
.section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #f0f3f6; }
.section-card-header h3 { font-size: 0.98rem; font-weight: 700; color: #1a2940; display: flex; align-items: center; gap: 8px; }
.view-all-btn { background: none; border: none; color: #3498db; font-family: 'Tajawal', sans-serif; font-size: 0.85rem; cursor: pointer; font-weight: 600; }

/* DATA TABLE */
.data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.data-table thead tr { background: #f8fafc; }
.data-table th { padding: 12px 18px; text-align: right; font-size: 0.75rem; font-weight: 700; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #edf0f3; white-space: nowrap; }
.data-table td { padding: 13px 18px; border-bottom: 1px solid #f5f7fa; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: #fafbfc; }

.user-cell { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.mini-avatar-tbl { width: 32px; height: 32px; background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
.book-cell { font-weight: 600; color: #1a2940; max-width: 180px; }
.bold-cell { font-weight: 700; color: #1a2940; }
.text-red { color: #e74c3c; }
.text-green { color: #27ae60; }
.text-small { font-size: 0.8rem; }
.text-muted { color: #95a5a6; }
.fw-bold { font-weight: 700; }
.book-thumb { width: 38px; height: 50px; object-fit: cover; border-radius: 6px; display: block; }

/* STATUS PILLS */
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.pill-active { background: #eafaf1; color: #1e8449; }
.pill-overdue { background: #fdf0f0; color: #c0392b; }
.pill-returned { background: #eaf4fd; color: #1a5276; }

/* ROLE BADGE */
.role-badge { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.role-student { background: #eaf4fd; color: #2e86c1; }
.role-faculty { background: #f4ecf7; color: #7d3c98; }
.role-librarian { background: #fef9e7; color: #d68910; }

/* CAT BADGE */
.cat-badge { background: #f0f2f5; color: #2c3e50; padding: 3px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 500; }

/* ADD BUTTON */
.add-btn { background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 12px rgba(46,134,193,0.3); }
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(46,134,193,0.4); }

/* FILTER BAR */
.filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-btn { padding: 7px 16px; border-radius: 20px; border: 2px solid #e0e6ed; background: white; color: #7f8c8d; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.85rem; font-weight: 500; transition: 0.2s; }
.filter-btn.active, .filter-btn:hover { border-color: #3498db; background: #3498db; color: white; }
.filter-spacer { flex: 1; }
.search-mini { display: flex; align-items: center; gap: 8px; background: white; border: 2px solid #e0e6ed; border-radius: 10px; padding: 7px 14px; }
.search-mini i { color: #aab7c4; font-size: 0.85rem; }
.search-mini input { border: none; outline: none; font-family: 'Tajawal', sans-serif; font-size: 0.88rem; color: #2c3e50; width: 170px; }

/* ACTION BUTTONS */
.action-btns { display: flex; gap: 6px; align-items: center; }
.act-edit { background: #eaf4fd; color: #2e86c1; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.act-edit:hover { background: #2e86c1; color: white; }
.act-delete { background: #fdf0f0; color: #e74c3c; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.act-delete:hover { background: #e74c3c; color: white; }
.act-return { background: #eafaf1; color: #27ae60; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 5px; transition: 0.2s; white-space: nowrap; }
.act-return:hover { background: #27ae60; color: white; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.modal { background: white; border-radius: 20px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { background: linear-gradient(135deg, #1a2940, #1e3a5f); color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
.modal-header h3 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.modal-close { background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.modal-close:hover { background: rgba(231,76,60,0.5); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.wizard-modal .modal-body {
  max-height: 62vh;
  overflow-y: auto;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #2c3e50; }
.form-group input, .form-group select { padding: 10px 14px; border: 2px solid #e8ecf0; border-radius: 10px; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; color: #2c3e50; outline: none; transition: 0.2s; background: white; }
.form-group input:focus, .form-group select:focus { border-color: #2e86c1; box-shadow: 0 0 0 3px rgba(46,134,193,0.1); }
.modal-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #edf0f3; display: flex; gap: 10px; justify-content: flex-left; }
.btn-cancel { flex: 1; padding: 11px; border: 2px solid #e0e6ed; background: white; color: #7f8c8d; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 600; transition: 0.2s; }
.btn-cancel:hover { border-color: #95a5a6; color: #2c3e50; }
.btn-save { flex: 2; padding: 11px; background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; border: none; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,134,193,0.3); }

/* WIZARD STYLES */
.wizard-progress { display: flex; align-items: center; justify-content: center; padding: 15px 0; background: #f8fafc; border-bottom: 1px solid #edf0f3; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; background: #e0e6ed; color: #7f8c8d; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
.step-dot.active { background: #3498db; color: white; }
.step-line { width: 40px; height: 2px; background: #e0e6ed; margin: 0 5px; }
.wizard-content h4 { margin-bottom: 15px; color: #1a2940; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
.authors-selection { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #edf0f3; border-radius: 10px; }
.author-checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.help-text { font-size: 0.75rem; color: #95a5a6; margin-top: 8px; }
.copy-row { display: grid; grid-template-columns: 1fr 1fr 40px; gap: 10px; align-items: flex-end; padding-bottom: 10px; border-bottom: 1px dashed #edf0f3; margin-bottom: 10px; }
.remove-btn { background: #fdf0f0; color: #e74c3c; border: none; height: 38px; border-radius: 8px; cursor: pointer; }
.add-row-btn { background: #eaf4fd; color: #2e86c1; border: 1px dashed #2e86c1; width: 100%; padding: 10px; border-radius: 10px; cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.85rem; font-weight: 600; }

.quick-add-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px dashed #c5d5e4;
}
.quick-add-bar.full-width { width: 100%; }
.quick-add-bar input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 2px solid #e8ecf0;
  border-radius: 8px;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.85rem;
}
.btn-quick-add {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.btn-quick-add:disabled { opacity: 0.6; cursor: not-allowed; }

.cover-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-preview img {
  width: 80px;
  height: 110px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #dce6ef;
}

@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .sidebar { width: 100%; }
  .sidebar-menu { display: flex; flex-wrap: wrap; gap: 6px; }
  .menu-item { padding: 8px 12px; font-size: 0.82rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .nav-center { display: none; }
}

.relative-parent { position: relative; }
.search-select-wrap { position: relative; width: 100%; }
.search-input { width: 100%; padding: 10px 14px; border: 2px solid #e8ecf0; border-radius: 10px; }
.search-results-dropdown { 
  position: absolute; top: 100%; left: 0; right: 0; 
  background: white; border: 1px solid #edf0f3; 
  border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
  z-index: 1050; max-height: 200px; overflow-y: auto; margin-top: 5px;
}
.search-result-item { 
  padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: 0.2s;
}
.search-result-item:hover { background: #f0f7fd; }
.search-result-item:last-child { border-bottom: none; }
.search-no-results { padding: 15px; text-align: center; color: #95a5a6; font-size: 0.85rem; }
.selected-item-tag { 
  display: flex; align-items: center; justify-content: space-between; 
  background: #eaf4fd; color: #2e86c1; padding: 10px 15px; 
  border-radius: 10px; margin-top: 10px; border: 1px solid #d4e6f1;
}
.remove-tag { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1rem; }
.disabled-input { background: #f8fafc !important; color: #7f8c8d !important; cursor: not-allowed; border: 2px solid #f0f3f6 !important; }

/* ===== TOAST NOTIFICATION ===== */
.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 340px;
  max-width: 520px;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
  backdrop-filter: blur(10px);
}
.toast-success {
  background: linear-gradient(135deg, #eafaf1, #f0fff4);
  border: 1px solid #a9dfbf;
}
.toast-error {
  background: linear-gradient(135deg, #fdf0f0, #fff5f5);
  border: 1px solid #fadbd8;
}
.toast-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
}
.toast-success .toast-icon { background: #27ae60; color: white; }
.toast-error .toast-icon { background: #e74c3c; color: white; }
.toast-content { flex: 1; }
.toast-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 3px; }
.toast-success .toast-title { color: #1e8449; }
.toast-error .toast-title { color: #c0392b; }
.toast-msg { font-size: 0.82rem; opacity: 0.8; }
.toast-success .toast-msg { color: #196f3d; }
.toast-error .toast-msg { color: #922b21; }
.toast-close {
  background: none; border: none; cursor: pointer; font-size: 0.9rem;
  opacity: 0.5; transition: 0.2s; padding: 4px;
}
.toast-close:hover { opacity: 1; }
.toast-slide-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translateX(-50%) translateY(-60px); opacity: 0; }
.toast-slide-leave-to { transform: translateX(-50%) translateY(-30px); opacity: 0; }

/* ===== ADMIN ROLE SELECTOR ===== */
.admin-role-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 6px;
}
.admin-role-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 10px;
  border: 2px solid #e8ecf0; border-radius: 12px;
  background: white; cursor: pointer; transition: all 0.2s;
  font-family: 'Tajawal', sans-serif; text-align: center;
}
.admin-role-card i { font-size: 1.4rem; color: #aab7c4; transition: 0.2s; }
.admin-role-card span { font-size: 0.85rem; font-weight: 600; color: #2c3e50; }
.admin-role-card:hover { border-color: #3498db; background: #f0f8ff; }
.admin-role-card:hover i { color: #3498db; }
.admin-role-card.selected { border-color: #2e86c1; background: linear-gradient(135deg, #eaf4fd, #f0f8ff); }
.admin-role-card.selected i { color: #1a5276; }
.admin-role-card.selected span { color: #1a5276; }

/* ===== MODAL API ERROR ===== */
.modal-api-error {
  background: #fdf0f0; color: #e74c3c;
  padding: 10px 14px; border-radius: 10px;
  font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
  border: 1px solid #fadbd8;
}

/* ===== AUTHOR TEXT INPUT ===== */
.author-input-wrap {
  position: relative; display: flex; align-items: center;
}
.author-input-icon {
  position: absolute; right: 14px; color: #aab7c4; font-size: 0.95rem; z-index: 1;
}
.author-text-input {
  width: 100%; padding: 12px 42px 12px 14px;
  border: 2px solid #e8ecf0; border-radius: 12px;
  font-family: 'Tajawal', sans-serif; font-size: 0.95rem;
  color: #2c3e50; outline: none; transition: 0.25s; background: white;
}
.author-text-input:focus { border-color: #2e86c1; box-shadow: 0 0 0 3px rgba(46,134,193,0.1); }

/* ===== AUTO GEN BADGE (لوحة الأدمن) ===== */
.auto-gen-badge {
  display: inline-flex; align-items: center; gap: 3px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white; padding: 2px 7px; border-radius: 20px;
  font-size: 0.65rem; font-weight: 600; margin-right: 5px;
}
.auto-gen-input {
  width: 100%; padding: 10px 14px;
  border: 2px dashed #d2b4de; border-radius: 10px;
  font-family: 'Tajawal', sans-serif; font-size: 0.85rem;
  background: linear-gradient(135deg, #f9f3ff, #fdf9ff);
  color: #7d3c98; font-style: italic; cursor: not-allowed;
}


</style>
