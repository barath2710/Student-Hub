import React, { useState, useEffect } from 'react'
import { generateQuiz, saveQuizAttempt, getQuizAttempts } from '../../services/aiService'
import ResourcePicker from '../jarvis/ResourcePicker'

export default function QuizPage() {
  // Views: 'list' (past attempts), 'create' (form), 'attempt' (taking quiz), 'results' (reviewing score)
  const [view, setView] = useState('list')
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Generator form state
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [count, setCount] = useState(10)
  const [attachedResource, setAttachedResource] = useState(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Active quiz attempt state
  const [activeQuiz, setActiveQuiz] = useState(null) // { title, subject, questions }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([]) // array of indices
  const [selectedOption, setSelectedOption] = useState(null) // chosen option index for current question

  // Results review state
  const [quizResult, setQuizResult] = useState(null) // saved QuizAttempt document

  // Fetch past attempts
  const fetchAttempts = async () => {
    setLoading(true)
    try {
      const res = await getQuizAttempts()
      setAttempts(res.data.data || [])
    } catch (err) {
      console.error('Failed to load quiz attempts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttempts()
  }, [])

  // Handle Generate
  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim() || !subject.trim()) {
      setError('Subject and Topic are required.')
      return
    }

    setGenerating(true)
    setError(null)
    try {
      const res = await generateQuiz(
        topic.trim(),
        count,
        attachedResource?._id || null,
        subject.trim()
      )

      setActiveQuiz(res.data.data)
      setUserAnswers(new Array(res.data.data.questions.length).fill(null))
      setCurrentQuestionIndex(0)
      setSelectedOption(null)
      setView('attempt')
    } catch (err) {
      setError(err.message || 'Failed to generate quiz questions')
    } finally {
      setGenerating(false)
    }
  }

  // Answer selection
  const handleSelectOption = (idx) => {
    setSelectedOption(idx)
    setUserAnswers(prev => {
      const copy = [...prev]
      copy[currentQuestionIndex] = idx
      return copy
    })
  }

  // Next / Submit Question
  const handleNext = async () => {
    if (selectedOption === null) return

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIdx)
      setSelectedOption(userAnswers[nextIdx])
    } else {
      // End of Quiz: Submit results to backend!
      setLoading(true)
      try {
        // Calculate score
        let correctCount = 0
        const weakAreasSet = new Set()

        activeQuiz.questions.forEach((q, idx) => {
          const userAns = userAnswers[idx]
          if (userAns === q.correctIndex) {
            correctCount++
          } else {
            // Add subject/topic or question hints to weak areas
            weakAreasSet.add(q.explanation?.substring(0, 100) || 'Review concepts')
          }
        })

        const percentScore = Math.round((correctCount / activeQuiz.questions.length) * 100)
        
        const payload = {
          title: activeQuiz.title,
          subject: activeQuiz.subject,
          questions: activeQuiz.questions,
          userAnswers,
          score: percentScore,
          weakAreas: Array.from(weakAreasSet).slice(0, 3) // store up to 3 explanations/weak points
        }

        const res = await saveQuizAttempt(payload)
        const savedAttempt = res.data.data
        
        // Add to history list
        setAttempts(prev => [savedAttempt, ...prev])
        setQuizResult(savedAttempt)
        setView('results')
      } catch (err) {
        setError(err.message || 'Failed to submit quiz scores')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIdx)
      setSelectedOption(userAnswers[prevIdx])
    }
  }

  const handleReviewAttempt = (attempt) => {
    setQuizResult(attempt)
    setView('results')
  }

  const handleCloseResults = () => {
    setQuizResult(null)
    setActiveQuiz(null)
    setView('list')
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[var(--bg-app)] page-enter">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">AI Quiz Arena</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Test your knowledge with multiple-choice questions generated by Jarvis.
          </p>
        </div>

        {/* View toggles */}
        {view !== 'attempt' && view !== 'results' && (
          <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] self-start md:self-auto">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                view === 'list'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              📊 Past Attempts
            </button>
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                view === 'create'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🪄 Generate Quiz
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        {/* VIEW 1: Past Attempts List */}
        {view === 'list' && (
          <div className="flex flex-col gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 h-24 animate-pulse" />
              ))
            ) : attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <span className="text-5xl mb-4 select-none">🏆</span>
                <h3 className="text-lg font-black text-[var(--text-primary)]">No quiz attempts yet</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm">
                  Generate a quiz using AI based on any academic subject or uploading reading documents.
                </p>
                <button
                  onClick={() => setView('create')}
                  className="mt-6 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Create AI Quiz
                </button>
              </div>
            ) : (
              attempts.map((att) => (
                <div
                  key={att._id}
                  onClick={() => handleReviewAttempt(att)}
                  className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-[var(--shadow-card)] hover:scale-[1.01]"
                >
                  <div className="min-w-0 pr-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-full capitalize">
                      {att.subject}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mt-2 truncate capitalize">
                      {att.title}
                    </h3>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                      Completed: {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className={`text-lg font-black ${
                        att.score >= 80 ? 'text-[var(--success)]' : att.score >= 50 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                      }`}>
                        {att.score}%
                      </span>
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold mt-0.5">
                        {att.questions?.length} MCQs
                      </p>
                    </div>
                    <span className="text-sm text-[var(--text-tertiary)] select-none">➔</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 2: Generate Form */}
        {view === 'create' && (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] p-6 sm:p-8 animate-[scaleIn_0.15s_ease-out]">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span>🪄</span> AI Quiz Generator
            </h2>

            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g. databases, human anatomy, general history"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={generating}
                  className="px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface-1)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
                />
              </div>

              {/* Topic */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Topic Details *
                </label>
                <textarea
                  placeholder="Describe what key concepts should be covered (e.g. database transactions, nervous system, World War 2 causes)."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                  rows={3}
                  className="px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface-1)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] resize-none"
                />
              </div>

              {/* MCQ Count */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Number of Questions ({count})
                </label>
                <div className="flex gap-3">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
                        count === num
                          ? 'bg-[var(--primary)] text-[var(--text-inverse)] border-[var(--primary)] shadow-xs'
                          : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Document */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Reference Study Document (Optional)
                </label>
                {attachedResource ? (
                  <div className="flex items-center justify-between p-3 border border-[var(--primary)] bg-[var(--primary-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] truncate">
                      <span>📕</span>
                      <span className="truncate">{attachedResource.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedResource(null)}
                      className="text-[var(--danger)] hover:bg-[var(--danger-subtle)] font-bold text-xs p-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-1)] rounded-xl py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  >
                    📁 Select study material
                  </button>
                )}
                <span className="text-[10px] text-[var(--text-tertiary)] italic leading-normal">
                  If selected, Jarvis will parse the file content and generate the MCQs directly from it.
                </span>
              </div>

              {/* Error block */}
              {error && (
                <div className="p-3.5 bg-[var(--danger-subtle)] text-[var(--danger-text)] text-xs font-semibold rounded-xl border border-[var(--danger)]">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-black text-sm rounded-xl transition-all shadow-sm mt-3 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="spinner text-[var(--text-inverse)]" /> Generating Quiz...
                  </>
                ) : (
                  <>🪄 Generate Quiz</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: Taking active quiz */}
        {view === 'attempt' && activeQuiz && (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] p-6 sm:p-8 animate-[scaleIn_0.15s_ease-out]">
            {/* Header info */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[var(--border)]">
              <span className="px-2.5 py-0.5 text-[9px] font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-full self-start capitalize">
                {activeQuiz.subject}
              </span>
              <h2 className="text-base font-black text-[var(--text-primary)] capitalize">
                {activeQuiz.title}
              </h2>
              {/* Progress bar */}
              <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[var(--primary)] h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="py-6">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <p className="text-sm font-bold text-[var(--text-primary)] mt-1.5 leading-relaxed">
                {activeQuiz.questions[currentQuestionIndex]?.question}
              </p>
            </div>

            {/* Radio options buttons */}
            <div className="flex flex-col gap-3">
              {activeQuiz.questions[currentQuestionIndex]?.options.map((opt, oIdx) => {
                const isChosen = selectedOption === oIdx
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                      isChosen
                        ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--text-primary)]'
                        : 'bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                      isChosen ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--text-inverse)]' : 'border-[var(--border-strong)] bg-[var(--card-bg)]'
                    }`}>
                      {isChosen ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-5 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-xs font-bold border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] rounded-xl disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                ← Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedOption === null || loading}
                className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-black text-xs rounded-xl disabled:opacity-40 transition-all shadow-xs flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner text-[var(--text-inverse)]" /> Submitting...
                  </>
                ) : currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                  'Submit Quiz'
                ) : (
                  'Next Question →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Score Results Summary */}
        {view === 'results' && quizResult && (
          <div className="flex flex-col gap-6 animate-[scaleIn_0.15s_ease-out]">
            {/* Score box */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] p-6 sm:p-8 text-center flex flex-col items-center">
              <span className="text-5xl mb-2 select-none">
                {quizResult.score >= 80 ? '🎉' : quizResult.score >= 50 ? '👍' : '📚'}
              </span>
              <h2 className="text-xl font-black text-[var(--text-primary)] mt-1">Quiz Completed!</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm capitalize">
                {quizResult.title}
              </p>

              {/* Big Score tag */}
              <div className="my-6">
                <span className={`text-5xl font-black ${
                  quizResult.score >= 80 ? 'text-[var(--success)]' : quizResult.score >= 50 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                }`}>
                  {quizResult.score}%
                </span>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">
                  Overall Score
                </p>
              </div>

              {/* Weak areas list */}
              {quizResult.weakAreas?.length > 0 && (
                <div className="w-full max-w-md bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-4 text-left my-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    💡 Study Recommendations
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {quizResult.weakAreas.map((w, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleCloseResults}
                className="mt-6 px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-black text-xs rounded-xl shadow-xs transition-all"
              >
                Back to dashboard
              </button>
            </div>

            {/* Questions detailed review */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider px-2">
                Questions review
              </h3>
              {quizResult.questions.map((q, qIdx) => {
                const userAns = quizResult.userAnswers[qIdx]
                const isCorrect = userAns === q.correctIndex

                return (
                  <div
                    key={qIdx}
                    className={`bg-[var(--card-bg)] border rounded-2xl p-5 flex flex-col gap-3 shadow-xs ${
                      isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-[var(--text-primary)] leading-normal pr-4">
                        {qIdx + 1}. {q.question}
                      </p>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    {/* Options list showing user vs correct */}
                    <div className="grid grid-cols-1 gap-2 my-1">
                      {q.options.map((opt, oIdx) => {
                        const wasChosenByUser = userAns === oIdx
                        const isCorrectOption = q.correctIndex === oIdx

                        return (
                          <div
                            key={oIdx}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                              isCorrectOption
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                                : wasChosenByUser
                                ? 'bg-rose-500/5 border-rose-500/30 text-rose-800 dark:text-rose-400'
                                : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <span>{opt}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {isCorrectOption ? 'Correct option' : wasChosenByUser ? 'Your answer' : ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed italic mt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resource Picker */}
      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(res) => {
          setAttachedResource(res)
          setIsPickerOpen(false)
        }}
        selectedId={attachedResource?._id}
      />
    </div>
  )
}
