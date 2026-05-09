import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const routes = [
  // ===== AUTH =====
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/auth/login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('../views/auth/register.vue'), meta: { guest: true } },

  // ===== STUDENT ROUTES =====
  {
    path: '/search',
    component: () => import('../views/books/SearchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/books/:id',
    component: () => import('../views/books/BookDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    component: () => import('../views/user/BorrowingHistory.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/fines',
    component: () => import('../views/user/FinesView.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/loans',
    redirect: '/history',
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    component: () => import('../views/user/ProfileView.vue'),
    meta: { requiresAuth: true }
  },

  // ===== ADMIN ROUTES =====
  {
    path: '/dashboard',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },

  // ===== CATCH ALL =====
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuth = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin

  // Guest-only routes (login, register)
  if (to.meta.guest) {
    if (isAuth) {
      return next(isAdmin ? '/dashboard' : '/search')
    }
    return next()
  }

  // Protected routes
  if (to.meta.requiresAuth && !isAuth) {
    return next('/login')
  }

  // Admin-only routes
  if (to.meta.role === 'admin' && !isAdmin) {
    return next('/search')
  }

  // Student-only routes (block admin)
  if (to.meta.role === 'student' && isAdmin) {
    return next('/dashboard')
  }

  next()
})

export default router