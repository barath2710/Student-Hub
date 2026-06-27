import { getNoteStats, getNotes } from './noteService'
import { getTaskStats, getTasks } from './taskService'
import { getResourceStats, getRecentResources } from './resourceService'

export const getDashboardData = async (timezoneOffset) => {
  const [
    noteStatsRes,
    taskStatsRes,
    recentNotesRes,
    upcomingTasksRes,
    resourceStatsRes,
    recentResourcesRes,
  ] = await Promise.all([
    getNoteStats(),
    getTaskStats({ timezoneOffset }),
    getNotes({ limit: 3, archived: false }),
    getTasks({ limit: 3, status: 'pending', timezoneOffset }),
    getResourceStats(),
    getRecentResources(),
  ])

  return {
    noteStats:       noteStatsRes.data.data,
    taskStats:       taskStatsRes.data.data,
    recentNotes:     recentNotesRes.data.data.notes,
    upcomingTasks:   upcomingTasksRes.data.data.tasks,
    resourceStats:   resourceStatsRes.data.data,
    recentResources: recentResourcesRes.data.data,
  }
}
