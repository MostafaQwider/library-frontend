import { defineStore } from 'pinia'
import { authService } from '../api/authService'
import { loanService } from '../api/loanService'
import { userService } from '../api/userService'
import { listFromResponse } from '../api/responseUtils'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    loans: [],
    fines: [],
    loansLoading: false,
    finesLoading: false,
    profileLoading: false
  }),

  getters: {
    activeLoans: (state) => state.loans.filter(l => l.status === 'ACTIVE'),
    overdueLoans: (state) => state.loans.filter(l => l.status === 'OVERDUE'),
    returnedLoans: (state) => state.loans.filter(l => l.status === 'RETURNED'),
    unpaidFines: (state) => state.fines.filter(f => f.status === 'UNPAID')
  },

  actions: {
    async fetchProfile() {
      this.profileLoading = true
      try {
        const res = await authService.getProfile()
        this.profile = res.data.data
      } catch (e) {
        console.error(e)
      } finally {
        this.profileLoading = false
      }
    },

    async fetchMyLoans() {
      this.loansLoading = true
      try {
        const res = await loanService.getMyLoans()
        this.loans = res.data.data || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loansLoading = false
      }
    },

    async fetchMyFines() {
      this.finesLoading = true
      try {
        const res = await userService.getMyFines()
        this.fines = listFromResponse(res)
      } catch (e) {
        console.error(e)
      } finally {
        this.finesLoading = false
      }
    }
  }
})
