import api from './axios'

export const recommendationService = {
  /** GET /api/recommendations — all recommendations */
  getAll() {
    return api.get('/recommendations')
  },

  /** GET /api/recommendations/user/:userId — recommendations for a specific user */
  getByUser(userId) {
    return api.get(`/recommendations/user/${userId}`)
  },

  /** POST /api/recommendations — create a new recommendation */
  create(data) {
    return api.post('/recommendations', data)
  },

  /** DELETE /api/recommendations/:id — delete a recommendation */
  delete(id) {
    return api.delete(`/recommendations/${id}`)
  }
}
