import api from './api'

/**
 * Auth service – thin wrappers around the pre-configured Axios instance.
 * All functions return the full Axios response so callers can access
 * response.data.data for the payload.
 */

export const registerUser  = (data) => api.post('/auth/register', data)
export const loginUser     = (data) => api.post('/auth/login',    data)
export const fetchMe       = ()     => api.get('/auth/me')
export const changePassword = (currentPassword, newPassword) =>
  api.put('/auth/me/password', { currentPassword, newPassword })
export const updateProfile = (name) =>
  api.put('/auth/me', { name })
