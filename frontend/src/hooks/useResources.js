import { useState, useEffect, useRef, useCallback } from 'react'
import { getResources, deleteResource as apiDelete, updateResource } from '../services/resourceService'

/**
 * Custom hook for managing the Study Resources page state.
 * Handles pagination, search, subject filtering, polling-free updates.
 */
export default function useResources() {
  const [resources, setResources]     = useState([])
  const [allSubjects, setAllSubjects] = useState([])
  const [pagination, setPagination]   = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // Filter / search state
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [subject, setSubject]         = useState('')

  const reqIdRef = useRef(0)

  const fetchResources = useCallback(async (opts = {}) => {
    const reqId = ++reqIdRef.current
    setLoading(true)
    setError(null)
    try {
      const res = await getResources({
        page:    opts.page    ?? page,
        limit:   12,
        search:  opts.search  ?? search,
        subject: opts.subject ?? subject,
      })
      if (reqId !== reqIdRef.current) return
      const { resources: list, allSubjects: subjects, pagination: pag } = res.data.data
      setResources(list)
      setAllSubjects(subjects || [])
      setPagination(pag)
    } catch (err) {
      if (reqId !== reqIdRef.current) return
      setError(err.message || 'Failed to load resources')
    } finally {
      if (reqId !== reqIdRef.current) return
      setLoading(false)
    }
  }, [page, search, subject])

  // Re-fetch when filters change
  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Handle search — reset to page 1
  const handleSearch = useCallback((value) => {
    setSearch(value)
    setPage(1)
  }, [])

  // Handle subject filter — reset to page 1
  const handleSubjectFilter = useCallback((value) => {
    setSubject(value)
    setPage(1)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
  }, [])

  // Delete a resource and refresh list
  const handleDelete = useCallback(async (id) => {
    await apiDelete(id)
    // If last item on page > 1, go back one page
    setPage(prev => (resources.length === 1 && prev > 1 ? prev - 1 : prev))
    fetchResources()
  }, [resources.length, fetchResources])

  // Rename a resource and optimistically update local state
  const handleRename = useCallback(async (id, data) => {
    const res = await updateResource(id, data)
    const updated = res.data.data
    setResources(prev => prev.map(r => (r._id === id ? updated : r)))
    return updated
  }, [])

  // Called after a successful upload to refresh
  const refetch = useCallback(() => {
    setPage(1)
    fetchResources({ page: 1 })
  }, [fetchResources])

  return {
    resources,
    allSubjects,
    pagination,
    loading,
    error,
    setError,
    page,
    search,
    subject,
    handleSearch,
    handleSubjectFilter,
    handlePageChange,
    handleDelete,
    handleRename,
    refetch,
  }
}
