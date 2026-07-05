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

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password })
export const socialLogin = (provider, id, email, name) => api.post('/auth/social-login', { provider, id, email, name })
export const mobileLogin = (phoneNumber) => api.post('/auth/mobile-login', { phoneNumber })
export const mobileVerify = (phoneNumber, code) => api.post('/auth/mobile-verify', { phoneNumber, code })
