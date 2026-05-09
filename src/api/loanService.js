import api from './axios'

export const loanService = {
  /** Admin / staff: all loans (backend filters by role) */
  getLoans(params = {}) {
    return api.get('/loans', { params })
  },
  /** Student: my loans — same path per API (`GET /api/loans` + pagination) */
  getMyLoans(params = {}) {
    return api.get('/loans', { params })
  },
  /** Borrow: `POST /api/loans/borrow` with `{ book_id }` */
  borrowBook(bookId, userId = null) {
    const payload = { book_id: bookId }
    if (userId) payload.user_id = userId
    return api.post('/loans/borrow', payload)
  },
  /** Return: `POST /api/loans/:id/return` */
  returnBook(loanId) {
    return api.post(`/loans/${loanId}/return`)
  },
  getLoan(id) {
    return api.get(`/loans/${id}`)
  }
}
