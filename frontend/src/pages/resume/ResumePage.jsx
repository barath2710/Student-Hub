import React, { useState, useEffect } from 'react'
import { analyzeResume, getResumeAnalyses, deleteResumeAnalysis } from '../../services/aiService'

export default function ResumePage() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [error, setError] = useState(null)

  // Active suggestions tab: 'content' | 'metrics' | 'formatting'
  const [activeTab, setActiveTab] = useState('content')

  // Fetch past analyses
  const fetchAnalyses = async () => {
    setLoading(true)
    try {
      const res = await getResumeAnalyses()
      setAnalyses(res.data.data || [])
      if (res.data.data?.length > 0 && !activeAnalysis) {
        setActiveAnalysis(res.data.data[0])
      }
    } catch (err) {
      console.error('Failed to load resume analyses', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
  }, [])

  // Handle direct file upload and analyze
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'txt'].includes(fileType)) {
      setError('Only PDF and TXT files are supported for resume analysis.')
      return
    }

    setAnalyzing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await analyzeResume(formData)
      const newAnalysis = res.data.data
      setAnalyses(prev => [newAnalysis, ...prev])
      setActiveAnalysis(newAnalysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze resume')
    } finally {
      setAnalyzing(false)
      // reset file input
      e.target.value = ''
    }
  }

  // Handle delete
  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this analysis record?')) return
    try {
      await deleteResumeAnalysis(id)
      setAnalyses(prev => prev.filter(a => a._id !== id))
      if (activeAnalysis?._id === id) {
        const remaining = analyses.filter(a => a._id !== id)
        setActiveAnalysis(remaining.length > 0 ? remaining[0] : null)
      }
    } catch (err) {
      alert('Failed to delete analysis: ' + err.message)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
    if (score >= 60) return 'text-amber-500 border-amber-500/20 bg-amber-500/5'
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5'
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden page-enter bg-[var(--bg-app)]">
      {/* Sidebar - History of past uploads */}
      <div className="w-80 h-full border-r border-[var(--border)] bg-[var(--surface-1)] flex flex-col shrink-0">
        {/* Upload box in sidebar */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--card-bg)] flex flex-col gap-3">
          <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl py-5 px-4 text-center cursor-pointer transition-all bg-[var(--surface-1)] hover:bg-[var(--surface-2)]">
            <span className="text-2xl mb-1">📄</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">Upload New Resume</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">PDF or TXT formats</span>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={analyzing}
            />
          </label>

          {analyzing && (
            <div className="flex flex-col items-center justify-center p-4 bg-[var(--primary-subtle)] border border-[var(--primary)] rounded-xl gap-2 animate-pulse">
              <span className="spinner text-[var(--primary)]" />
              <span className="text-[10px] font-bold text-[var(--primary)] text-center">
                Jarvis is parsing resume & compiling ATS score...
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[var(--danger-subtle)] text-[var(--danger-text)] text-[10px] font-bold rounded-xl border border-[var(--danger)] leading-normal">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 no-scrollbar">
          <div className="px-2 pb-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Past Uploads ({analyses.length})
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse" />
            ))
          ) : analyses.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-tertiary)] italic">
              No resumes uploaded yet
            </div>
          ) : (
            analyses.map((ana) => {
              const isActive = activeAnalysis?._id === ana._id
              return (
                <div
                  key={ana._id}
                  onClick={() => setActiveAnalysis(ana)}
                  className={`group relative w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[var(--card-bg)] border-[var(--border-strong)] shadow-xs'
                      : 'border-transparent hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="min-w-0 pr-8">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {ana.fileName}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                      ATS: {ana.atsScore}% • {new Date(ana.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteAnalysis(ana._id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--surface-3)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                  >
                    🗑
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Analysis Results View */}
      <div className="flex-1 h-full overflow-y-auto p-6 sm:p-8 flex flex-col no-scrollbar">
        {activeAnalysis ? (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-[scaleIn_0.15s_ease-out]">
            {/* Header / ATS Score ring */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-[var(--shadow-card)]">
              {/* Radial circle for Score */}
              <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${getScoreColor(activeAnalysis.atsScore)}`}>
                <span className="text-4xl font-black">{activeAnalysis.atsScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">ATS Score</span>
              </div>

              {/* Summary text */}
              <div className="flex-1 text-center md:text-left">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[var(--primary-subtle)] text-[var(--primary)] rounded-full uppercase tracking-wider">
                  ATS Match Insight
                </span>
                <h2 className="text-xl font-black text-[var(--text-primary)] mt-3">
                  Resume: {activeAnalysis.fileName}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {activeAnalysis.summary}
                </p>
              </div>
            </div>

            {/* Grid for Strengths & Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Strengths */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>✅</span> Key Strengths
                </h3>
                <ul className="flex flex-col gap-3">
                  {activeAnalysis.strengths?.map((str, idx) => (
                    <li key={idx} className="text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5 bg-[var(--surface-1)] border border-[var(--border)] p-3 rounded-xl">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Suggestions & Improvements */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow-card)] flex flex-col">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>💡</span> Areas for Improvement
                </h3>

                {/* Suggestions Tabs */}
                <div className="flex border-b border-[var(--border)] pb-2 mb-4 gap-4">
                  {['content', 'metrics', 'formatting'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold capitalize pb-1 transition-all border-b-2 ${
                        activeTab === tab
                          ? 'border-[var(--primary)] text-[var(--text-primary)]'
                          : 'border-transparent text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content list */}
                <div className="flex-1 overflow-y-auto max-h-72">
                  <ul className="flex flex-col gap-2.5">
                    {activeAnalysis.suggestions?.[activeTab]?.map((sug, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5 bg-[var(--surface-1)] p-3 border border-[var(--border)] rounded-xl">
                        <span className="text-amber-500 shrink-0 font-bold">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.suggestions?.[activeTab] || activeAnalysis.suggestions[activeTab].length === 0) && (
                      <li className="text-xs text-[var(--text-secondary)] italic p-4 text-center">
                        No formatting suggestions. Excellent work!
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Customized Interview Prep questions */}
            {activeAnalysis.interviewPreparation?.length > 0 && (
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
                <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>🎯</span> Personalized Interview Preparation
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-6">
                  Jarvis constructed these study questions exactly based on your listed skills and experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeAnalysis.interviewPreparation.map((prep, idx) => (
                    <div key={idx} className="border border-[var(--border)] bg-[var(--surface-1)] rounded-2xl p-5 flex flex-col gap-4">
                      <span className="text-xs font-extrabold text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--border)] px-3 py-1 rounded-full self-start capitalize">
                        {prep.topic}
                      </span>
                      <ul className="flex flex-col gap-3">
                        {prep.questions?.map((q, qIdx) => (
                          <li key={qIdx} className="text-xs text-[var(--text-secondary)] leading-relaxed flex gap-2">
                            <span className="font-bold text-[var(--text-tertiary)]">{qIdx + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
            <span className="text-6xl mb-4 select-none">💼</span>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Resume & ATS Analyzer</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
              Upload your resume in PDF or TXT format. Jarvis will parse the file, calculate ATS score matches, identify structural errors, and tailor personal interview prep sheets.
            </p>
            <label className="mt-6 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all">
              Upload Resume File
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={analyzing}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
