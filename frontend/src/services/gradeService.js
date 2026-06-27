// ─── Grades API Service ────────────────────────────────────────────────────────
import api from './api'

/** Get all grades. Optionally filter by courseId, semester, or type. */
export const getGrades = (params = {}) =>
  api.get('/grades', { params })

/** Get a single grade by id. */
export const getGrade = (id) =>
  api.get(`/grades/${id}`)

/** Get GPA summary aggregated by course and overall. */
export const getGradeSummary = (params = {}) =>
  api.get('/grades/summary', { params })

/** Create a new grade entry. */
export const createGrade = (data) =>
  api.post('/grades', data)

/** Update an existing grade by id. */
export const updateGrade = (id, data) =>
  api.put(`/grades/${id}`, data)

/** Delete a grade by id. */
export const deleteGrade = (id) =>
  api.delete(`/grades/${id}`)
