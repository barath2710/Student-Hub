import { useState, useEffect, useRef, useCallback } from 'react'
import { logSession } from '../services/pomodoroService'

// ─── Session type configurations ──────────────────────────────────────────────
export const SESSION_TYPES = {
  focus:      { label: 'Focus',       duration: 25, color: '#7C3AED' },
  shortBreak: { label: 'Short Break', duration: 5,  color: '#0D9488' },
  longBreak:  { label: 'Long Break',  duration: 15, color: '#D97706' },
}

// ─────────────────────────────────────────────────────────────────────────────
export function usePomodoroTimer({ onSessionComplete } = {}) {
  const [sessionType, setSessionType]   = useState('focus')
  const [timeLeft,    setTimeLeft]      = useState(SESSION_TYPES.focus.duration * 60)
  const [isRunning,   setIsRunning]     = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [justCompleted, setJustCompleted] = useState(false)

  // Track the planned duration when session started (for logging)
  const plannedDurationRef  = useRef(SESSION_TYPES.focus.duration)
  const sessionStartTimeRef = useRef(null)
  const intervalRef         = useRef(null)
  const isRunningRef        = useRef(false)

  // ── Derived values ──────────────────────────────────────────────────────────
  const config        = SESSION_TYPES[sessionType]
  const totalSeconds  = config.duration * 60
  const progress      = (totalSeconds - timeLeft) / totalSeconds  // 0 → 1
  const minutes       = Math.floor(timeLeft / 60)
  const seconds       = timeLeft % 60

  // ── Clear interval helper ───────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // ── Session complete handler ────────────────────────────────────────────────
  const handleComplete = useCallback(async (type, planned) => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 2000)

    if (type === 'focus') {
      setSessionCount(c => c + 1)
    }

    // Calculate actual duration in minutes
    const elapsed = sessionStartTimeRef.current
      ? Math.round((Date.now() - sessionStartTimeRef.current) / 60000)
      : planned
    const actualDuration = Math.max(1, Math.min(elapsed, planned))

    try {
      await logSession({
        sessionType:     type,
        duration:        actualDuration,
        plannedDuration: planned,
        completedAt:     new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to log Pomodoro session:', err)
    }

    onSessionComplete?.({ sessionType: type, duration: actualDuration })
  }, [clearTimer, onSessionComplete])

  // ── Start ───────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (isRunningRef.current) return
    setIsRunning(true)
    isRunningRef.current  = true
    sessionStartTimeRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // We need to use a timeout so state reads are fresh
          const type    = sessionType
          const planned = plannedDurationRef.current
          setTimeout(() => handleComplete(type, planned), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [sessionType, handleComplete])

  // ── Pause ───────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
  }, [clearTimer])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    sessionStartTimeRef.current = null
    const dur = SESSION_TYPES[sessionType].duration * 60
    setTimeLeft(dur)
  }, [clearTimer, sessionType])

  // ── Change session type ──────────────────────────────────────────────────────
  const changeSessionType = useCallback((type) => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    sessionStartTimeRef.current = null
    setSessionType(type)
    const dur = SESSION_TYPES[type].duration * 60
    setTimeLeft(dur)
    plannedDurationRef.current = SESSION_TYPES[type].duration
  }, [clearTimer])

  // ── Sync plannedDurationRef when sessionType changes ────────────────────────
  useEffect(() => {
    plannedDurationRef.current = SESSION_TYPES[sessionType].duration
  }, [sessionType])

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => clearTimer(), [clearTimer])

  // ── Update document title with timer ────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
      const ss = String(timeLeft % 60).padStart(2, '0')
      document.title = `${mm}:${ss} — ${config.label} | StudentHub`
    } else {
      document.title = 'Pomodoro | StudentHub'
    }
    return () => { document.title = 'StudentHub' }
  }, [isRunning, timeLeft, config.label])

  return {
    // State
    sessionType,
    timeLeft,
    isRunning,
    sessionCount,
    justCompleted,
    // Derived
    config,
    progress,
    minutes,
    seconds,
    totalSeconds,
    // Actions
    start,
    pause,
    reset,
    changeSessionType,
  }
}
