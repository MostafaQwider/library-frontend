import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, error => Promise.reject(error))

// Response interceptor: handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    const isLoginRequest = error.config?.url?.includes('login')
    const isLoginPage = window.location.pathname.includes('/login')

    // Only redirect to login if the error is 401, we aren't logging in, and we aren't already on the login page
    if (error.response?.status === 401 && !isLoginRequest && !isLoginPage) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
