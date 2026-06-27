import { useState, useEffect, useCallback, useRef } from 'react'
import * as taskService from '../services/taskService'

export default function useTasks() {
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 })
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0,
    completionRate: 0,
    priorityBreakdown: { low: 0, medium: 0, high: 0 }
  })
  
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // 'pending', 'completed' or '' (all)
  const [priorityFilter, setPriorityFilter] = useState('') // 'low', 'medium', 'high' or '' (all)
  const [page, setPage] = useState(1)

  const fetchRequestCountRef = useRef(0)

  // Get user's timezone offset in minutes (e.g. -330 for UTC+5:30)
  const timezoneOffset = new Date().getTimezoneOffset()

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter, priorityFilter])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await taskService.getTaskStats({ timezoneOffset })
      setStats(res.data.data)
    } catch (err) {
      console.error('Error fetching task stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [timezoneOffset])

  // Fetch tasks with stale-request protection
  const fetchTasks = useCallback(async () => {
    const currentRequestId = ++fetchRequestCountRef.current
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: 10,
        timezoneOffset
      }
      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter

      const res = await taskService.getTasks(params)

      if (currentRequestId === fetchRequestCountRef.current) {
        setTasks(res.data.data.tasks)
        setPagination(res.data.data.pagination)
      }
    } catch (err) {
      if (currentRequestId === fetchRequestCountRef.current) {
        setError(err.message || 'Failed to fetch tasks')
      }
    } finally {
      if (currentRequestId === fetchRequestCountRef.current) {
        setLoading(false)
      }
    }
  }, [page, debouncedSearchQuery, statusFilter, priorityFilter, timezoneOffset])

  // Trigger fetch tasks when dependencies change
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Load stats initially
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Create task
  const handleCreateTask = async (taskData) => {
    setSubmitting(true)
    setError(null)
    try {
      await taskService.createTask(taskData, { timezoneOffset })
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err) {
      setError(err.message || 'Failed to create task')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Update task
  const handleUpdateTask = async (id, taskData) => {
    setSubmitting(true)
    setError(null)
    try {
      await taskService.updateTask(id, taskData, { timezoneOffset })
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err) {
      setError(err.message || 'Failed to update task')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle quick-complete
  const handleToggleTaskStatus = async (id) => {
    setError(null)
    try {
      await taskService.toggleTaskStatus(id)
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err) {
      setError(err.message || 'Failed to toggle task completion status')
      throw err
    }
  }

  // Delete task
  const handleDeleteTask = async (id) => {
    setError(null)
    try {
      await taskService.deleteTask(id)
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err) {
      setError(err.message || 'Failed to delete task')
      throw err
    }
  }

  const clearError = useCallback(() => setError(null), [])

  return {
    tasks,
    pagination,
    stats,
    loading,
    statsLoading,
    submitting,
    error,
    clearError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    page,
    setPage,
    refetch: fetchTasks,
    handleCreateTask,
    handleUpdateTask,
    handleToggleTaskStatus,
    handleDeleteTask
  }
}
