import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Context Providers
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider }  from './context/AuthContext'

// ── Route Guards & Layout
import PrivateRoute from './components/common/PrivateRoute'
import AppLayout    from './components/layout/AppLayout'

// ── Auth pages (public)
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// ── Protected pages
import Dashboard   from './pages/dashboard/Dashboard'
import Notes       from './pages/notes/Notes'
import Tasks       from './pages/tasks/Tasks'
import Profile     from './pages/profile/Profile'
import Courses     from './pages/courses/Courses'
import Assignments from './pages/assignments/Assignments'
import Grades      from './pages/grades/Grades'
import Resources   from './pages/resources/Resources'
import Pomodoro   from './pages/pomodoro/PomodoroPage'
import Jarvis     from './pages/jarvis/JarvisPage'
import Flashcards from './pages/flashcards/FlashcardsPage'
import Quiz       from './pages/quiz/QuizPage'
import Resume     from './pages/resume/ResumePage'
import Scheduler  from './pages/scheduler/SchedulerPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ─────────────────────────────────────────────── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* ── Protected — AppLayout wraps all child routes ────────── */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/notes"       element={<Notes />} />
              <Route path="/tasks"       element={<Tasks />} />
              <Route path="/resources"   element={<Resources />} />
              <Route path="/scheduler"   element={<Scheduler />} />
              <Route path="/profile"     element={<Profile />} />
              <Route path="/courses"     element={<Courses />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/grades"      element={<Grades />} />
              <Route path="/pomodoro"    element={<Pomodoro />} />
              <Route path="/jarvis"      element={<Jarvis />} />
              <Route path="/flashcards"  element={<Flashcards />} />
              <Route path="/quiz"        element={<Quiz />} />
              <Route path="/resume"      element={<Resume />} />
            </Route>

            {/* ── Redirects ──────────────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
