import api from './api'

/**
 * Get all resources with optional pagination, search, and subject filter
 * @param {Object} params - { page, limit, search, subject }
 */
export const getResources = (params = {}) =>
  api.get('/resources', { params })

/**
 * Get recent resources (last 5)
 */
export const getRecentResources = () =>
  api.get('/resources/recent')

/**
 * Get resource statistics (totalResources)
 */
export const getResourceStats = () =>
  api.get('/resources/stats')

/**
 * Upload a new resource file with metadata
 * @param {FormData} formData - contains: file, title, description, subject
 * @param {Function} onUploadProgress - progress callback (optional)
 */
export const uploadResource = (formData, onUploadProgress) =>
  api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })

/**
 * Rename / update metadata for a resource
 * @param {string} id
 * @param {Object} data - { title, description, subject }
 */
export const updateResource = (id, data) =>
  api.patch(`/resources/${id}`, data)

/**
 * Delete a resource (file + record)
 * @param {string} id
 */
export const deleteResource = (id) =>
  api.delete(`/resources/${id}`)
