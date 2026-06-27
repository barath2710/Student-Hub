// ─── Assignments API Service ───────────────────────────────────────────────────
import api from './api'

/** Get all assignments. Optionally filter by courseId, status, or priority. */
export const getAssignments = (params = {}) =>
  api.get('/assignments', { params })

/** Get a single assignment by id. */
export const getAssignment = (id) =>
  api.get(`/assignments/${id}`)

/** Create a new assignment. */
export const createAssignment = (data) =>
  api.post('/assignments', data)

/** Update an existing assignment by id. */
export const updateAssignment = (id, data) =>
  api.put(`/assignments/${id}`, data)

/** Delete an assignment by id. */
export const deleteAssignment = (id) =>
  api.delete(`/assignments/${id}`)
