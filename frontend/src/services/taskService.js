import api from './api'

export const getTasks = async (params) => {
  return api.get('/tasks', { params })
}

export const getTaskById = async (id) => {
  return api.get(`/tasks/${id}`)
}

export const getTaskStats = async (params) => {
  return api.get('/tasks/stats', { params })
}

export const createTask = async (data, params) => {
  return api.post('/tasks', data, { params })
}

export const updateTask = async (id, data, params) => {
  return api.put(`/tasks/${id}`, data, { params })
}

export const toggleTaskStatus = async (id) => {
  return api.patch(`/tasks/${id}/toggle`)
}

export const deleteTask = async (id) => {
  return api.delete(`/tasks/${id}`)
}
