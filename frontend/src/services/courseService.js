// ─── Courses API Service ───────────────────────────────────────────────────────
import api from './api'

/** Get all courses. Optionally filter by status or semester. */
export const getCourses = (params = {}) =>
  api.get('/courses', { params })

/** Get a single course by id. */
export const getCourse = (id) =>
  api.get(`/courses/${id}`)

/** Create a new course. */
export const createCourse = (data) =>
  api.post('/courses', data)

/** Update an existing course by id. */
export const updateCourse = (id, data) =>
  api.put(`/courses/${id}`, data)

/** Delete a course by id. */
export const deleteCourse = (id) =>
  api.delete(`/courses/${id}`)
