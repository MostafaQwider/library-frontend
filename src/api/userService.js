import api from './axios'

export const userService = {
  getUsers(params = {}) {
    return api.get('/users', { params })
  },
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  },
  toggleStatus(id, status) {
    return api.patch(`/users/${id}/status`, { status })
  },
  getMyFines() {
    return api.get('/fines')
  },
  getProfile() {
    return api.get('/users/profile')
  },
  updateProfile(data) {
    return api.put('/users/profile', data)
  }
}
