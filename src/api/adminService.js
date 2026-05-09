import api from './axios'

export const adminService = {
  // Fines
  getFines(params = {}) {
    return api.get('/fines', { params })
  },
  updateFine(id, data) {
    return api.put(`/fines/${id}`, data)
  },
  createFine(data) {
    return api.post('/fines', data)
  },

  payFine(id) {
    return api.post(`/fines/${id}/pay`)
  },

  confirmDeposit(body) {
    return api.post('/payments/deposit/confirm', body)
  },

  // Borrow Policy
  getBorrowPolicy() {
    return api.get('/borrow-policy')
  },
  updateBorrowPolicy(roleId, data) {
    return api.put(`/borrow-policy/${roleId}`, data)
  }
}
