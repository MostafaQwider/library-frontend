import { defineStore } from 'pinia'
import { authService } from '../api/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => {
      const role = state.user?.role?.name || state.user?.role || ''
      return ['ADMIN', 'LIBRARIAN', 'admin', 'librarian'].includes(role)
    },
    isStudent: (state) => {
      const role = state.user?.role?.name || state.user?.role || ''
      return ['STUDENT', 'student'].includes(role)
    },
    userName: (state) => state.user?.full_name || state.user?.name || 'مستخدم',
    userRole: (state) => state.user?.role?.name || state.user?.role || ''
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const res = await authService.login(email, password)
        console.log('LOGIN RESPONSE:', res)
        const { token, user } = res.data.data
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        return { success: true, user }
      } catch (err) {
        const msg = err.response?.data?.message || 'فشل تسجيل الدخول'
        this.error = msg
        return { success: false, message: msg }
      } finally {
        this.loading = false
      }
    },

    async register(data) {
      this.loading = true
      this.error = null
      try {
        const res = await authService.register(data)
        return { success: true, message: res.data.message }
      } catch (err) {
        const msg = err.response?.data?.message || 'فشل إنشاء الحساب'
        this.error = msg
        return { success: false, message: msg }
      } finally {
        this.loading = false
      }
    },

    async loadUser() {
      if (!this.token) return
      try {
        const res = await authService.getProfile()
        this.user = res.data.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
