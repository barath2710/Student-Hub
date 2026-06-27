import { useState, useEffect, useCallback, useRef } from 'react'
import { getDashboardData } from '../services/dashboardService'
import * as taskService from '../services/taskService'

export default function useDashboard() {
  const [data, setData] = useState({
    noteStats: { totalNotes: 0, pinnedNotes: 0, archivedNotes: 0, totalTags: 0 },
    taskStats: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      dueTodayTasks: 0,
      completionRate: 0,
      priorityBreakdown: { low: 0, medium: 0, high: 0 }
    },
    recentNotes: [],
    upcomingTasks: [],
    resourceStats: { totalResources: 0 },
    recentResources: [],
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchRequestCountRef = useRef(0)
  const timezoneOffset = new Date().getTimezoneOffset()

  const fetchDashboard = useCallback(async () => {
    const currentRequestId = ++fetchRequestCountRef.current
    setLoading(true)
    setError(null)
    try {
      const dashboardData = await getDashboardData(timezoneOffset)
      
      if (currentRequestId === fetchRequestCountRef.current) {
        setData(dashboardData)
      }
    } catch (err) {
      if (currentRequestId === fetchRequestCountRef.current) {
        setError(err.message || 'Failed to load dashboard data')
      }
    } finally {
      if (currentRequestId === fetchRequestCountRef.current) {
        setLoading(false)
      }
    }
  }, [timezoneOffset])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Quick action: quick toggle task status from dashboard
  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleTaskStatus(taskId)
      // Refresh dashboard data
      await fetchDashboard()
    } catch (err) {
      console.error('Failed to toggle task from dashboard:', err)
      throw err
    }
  }

  const clearError = useCallback(() => setError(null), [])

  return {
    ...data,
    loading,
    error,
    clearError,
    refetch: fetchDashboard,
    handleToggleTask
  }
}
