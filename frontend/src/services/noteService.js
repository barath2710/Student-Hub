import api from './api'

export const getNotes = async (params) => {
  return api.get('/notes', { params })
}

export const getNoteById = async (id) => {
  return api.get(`/notes/${id}`)
}

export const getNoteStats = async () => {
  return api.get('/notes/stats')
}

export const getTags = async () => {
  return api.get('/notes/tags')
}

export const createNote = async (data) => {
  return api.post('/notes', data)
}

export const updateNote = async (id, data) => {
  return api.put(`/notes/${id}`, data)
}

export const togglePin = async (id) => {
  return api.patch(`/notes/${id}/pin`)
}

export const toggleArchive = async (id) => {
  return api.patch(`/notes/${id}/archive`)
}

export const deleteNote = async (id) => {
  return api.delete(`/notes/${id}`)
}
