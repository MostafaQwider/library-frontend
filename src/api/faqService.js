import api from './axios'

export const faqService = {
  getAll: () => api.get('/faq'),
  getById: (id) => api.get(`/faq/${id}`),
  create: (data) => api.post('/faq', data),
  update: (id, data) => api.put(`/faq/${id}`, data),
  delete: (id) => api.delete(`/faq/${id}`),
  search: (question) => api.get('/faq/search', { params: { question } })
}
