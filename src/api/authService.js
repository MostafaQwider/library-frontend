import api from './axios'

export const authService = {
  login(email, password) {
    return api.post('/users/login', { email, password })
  },
  register(data) {
    return api.post('/users/register', {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      university_number: data.universityNumber,
      password: data.password
    })
  },
  getProfile() {
    return api.get('/users/profile')
  }
}
