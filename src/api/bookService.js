import api from './axios'

export const bookService = {
  // Books CRUD
  getBooks(params = {}) {
    return api.get('/books', { params })
  },
  /** `GET /books/search?q=...` */
  searchBooks(q, params = {}) {
    return api.get('/books/search', { params: { q, ...params } })
  },
  getBook(id) {
    return api.get(`/books/${id}`)
  },
  createFullBook(data) {
    return api.post('/books/full', data)
  },
  updateBook(id, data) {
    return api.put(`/books/${id}`, data)
  },
  deleteBook(id) {
    return api.delete(`/books/${id}`)
  },

  // Authors
  getAuthors() {
    return api.get('/authors')
  },
  createAuthor(data) {
    return api.post('/authors', data)
  },
  updateAuthor(id, data) {
    return api.put(`/authors/${id}`, data)
  },
  deleteAuthor(id) {
    return api.delete(`/authors/${id}`)
  },

  // Publishers
  getPublishers() {
    return api.get('/publishers')
  },
  createPublisher(data) {
    return api.post('/publishers', data)
  },
  updatePublisher(id, data) {
    return api.put(`/publishers/${id}`, data)
  },
  deletePublisher(id) {
    return api.delete(`/publishers/${id}`)
  },

  // Categories
  getCategories() {
    return api.get('/categories')
  },
  createCategory(data) {
    return api.post('/categories', data)
  },
  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data)
  },
  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  },

  // Locations
  getLocations() {
    return api.get('/locations')
  },
  createLocation(data) {
    return api.post('/locations', data)
  },
  updateLocation(id, data) {
    return api.put(`/locations/${id}`, data)
  },
  deleteLocation(id) {
    return api.delete(`/locations/${id}`)
  },

  // Book Copies
  getCopies(bookId) {
    return api.get(`/books/${bookId}/copies`)
  },
  updateCopy(id, data) {
    return api.put(`/copies/${id}`, data)
  }
}
