import api from './api'

export const getStudyPlans = async () => {
  const response = await api.get('/study-plans')
  return response.data.data
}

export const getStudyPlanById = async (id) => {
  const response = await api.get(`/study-plans/${id}`)
  return response.data.data
}

export const createStudyPlan = async (data) => {
  const response = await api.post('/study-plans', data)
  return response.data.data
}

export const updateBlockStatus = async (planId, blockId, status) => {
  const response = await api.patch(`/study-plans/${planId}/block/${blockId}`, { status })
  return response.data.data
}

export const deleteStudyPlan = async (id) => {
  const response = await api.delete(`/study-plans/${id}`)
  return response.data.data
}
