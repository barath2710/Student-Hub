import React, { useState, useEffect } from 'react'
import { getFlashcardSets, deleteFlashcardSet, generateFlashcards } from '../../services/aiService'
import ResourcePicker from '../jarvis/ResourcePicker'

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)
  
  // Tabs: 'browse' or 'create'
  const [activeTab, setActiveTab] = useState('browse')

  // Form State
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [count, setCount] = useState(10)
  const [attachedResource, setAttachedResource] = useState(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Playing Deck State
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Fetch Decks
  const fetchDecks = async () => {
    setLoading(true)
    try {
      const res = await getFlashcardSets()
      setDecks(res.data.data || [])
    } catch (err) {
      console.error('Failed to load flashcard decks', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  // Delete Deck
  const handleDeleteDeck = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this flashcard set?')) return
    try {
      await deleteFlashcardSet(id)
      setDecks(prev => prev.filter(d => d._id !== id))
      if (selectedDeck?._id === id) {
        setSelectedDeck(null)
      }
    } catch (err) {
      alert('Failed to delete deck: ' + err.message)
    }
  }

  // Handle Generate
  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      setError('Please provide a topic or concept.')
      return
    }
    if (!subject.trim()) {
      setError('Please provide a subject (e.g. computer science, history).')
      return
    }

    setGenerating(true)
    setError(null)
    try {
      const res = await generateFlashcards(
        topic.trim(),
        count,
        attachedResource?._id || null,
        subject.trim()
      )
      const newDeck = res.data.data
      setDecks(prev => [newDeck, ...prev])
      
      // Auto open the new deck
      setSelectedDeck(newDeck)
      setCurrentCardIndex(0)
      setIsFlipped(false)
      setActiveTab('browse')

      // Clear Form
      setTopic('')
      setSubject('')
      setCount(10)
      setAttachedResource(null)
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards')
    } finally {
      setGenerating(false)
    }
  }

  // Play Deck Handlers
  const handleNext = () => {
    if (!selectedDeck) return
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev + 1) % selectedDeck.cards.length)
    }, 150)
  }

  const handlePrev = () => {
    if (!selectedDeck) return
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev - 1 + selectedDeck.cards.length) % selectedDeck.cards.length)
    }, 150)
  }

  const handleShuffle = () => {
    if (!selectedDeck) return
    setIsFlipped(false)
    setTimeout(() => {
      const shuffledCards = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
      setSelectedDeck({ ...selectedDeck, cards: shuffledCards })
      setCurrentCardIndex(0)
    }, 150)
  }

  // Called when user picks a resource from the ResourcePicker modal
  const handleSelectResource = (resource) => {
    setAttachedResource(resource)
    setIsPickerOpen(false)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[var(--bg-app)] page-enter">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">AI Flashcard Decks</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Study smarter with custom flashcards generated dynamically from topics or files.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] self-start md:self-auto">
          <button
            onClick={() => {
              setActiveTab('browse')
              setSelectedDeck(null)
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'browse' && !selectedDeck
                ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🎴 Browse Decks
          </button>
          <button
            onClick={() => {
              setActiveTab('create')
              setSelectedDeck(null)
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🪄 Create AI Deck
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* VIEW 1: Playing a Deck */}
        {selectedDeck && (
          <div className="flex flex-col gap-6 animate-[scaleIn_0.15s_ease-out]">
            {/* Playing Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDeck(null)}
                  className="px-3 py-1.5 text-xs font-bold border border-[var(--border)] rounded-lg hover:bg-[var(--surface-2)] transition-colors text-[var(--text-primary)]"
                >
                  ← Back to list
                </button>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">
                    {selectedDeck.title}
                  </h2>
                  <p className="text-[10px] text-[var(--text-secondary)] capitalize font-semibold tracking-wider">
                    {selectedDeck.subject} • {selectedDeck.cards.length} cards
                  </p>
                </div>
              </div>
              <button
                onClick={handleShuffle}
                className="px-3 py-1.5 text-xs font-semibold border border-[var(--border)] rounded-lg hover:bg-[var(--surface-2)] transition-colors text-[var(--text-primary)]"
              >
                🔀 Shuffle
              </button>
            </div>

            {/* Flashcard Player Box */}
            <div className="flex flex-col items-center justify-center py-10">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-xl h-80 perspective-1000 cursor-pointer"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT side */}
                  <div className="absolute inset-0 bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-3xl shadow-[var(--shadow-md)] flex flex-col items-center justify-center p-8 backface-hidden text-center hover:border-[var(--border-strong)] transition-all">
                    <span className="absolute top-4 left-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                      Question / Concept
                    </span>
                    <p className="text-lg font-bold text-[var(--text-primary)] leading-normal max-w-md">
                      {selectedDeck.cards[currentCardIndex]?.front}
                    </p>
                    <span className="absolute bottom-4 text-xs text-[var(--text-secondary)] font-semibold opacity-60">
                      Tap card to flip
                    </span>
                  </div>

                  {/* BACK side */}
                  <div className="absolute inset-0 bg-indigo-600 border-2 border-indigo-700 text-white rounded-3xl shadow-[var(--shadow-md)] flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 text-center">
                    <span className="absolute top-4 left-4 text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                      Answer / Explanation
                    </span>
                    <p className="text-base font-medium leading-relaxed max-w-md">
                      {selectedDeck.cards[currentCardIndex]?.back}
                    </p>
                    <span className="absolute bottom-4 text-xs text-indigo-200 font-semibold opacity-60">
                      Tap card to flip back
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6 mt-8">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 flex items-center justify-center border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] rounded-full transition-all text-lg font-bold shadow-xs active:scale-95"
                >
                  ←
                </button>
                <span className="text-xs font-bold text-[var(--text-secondary)] select-none">
                  {currentCardIndex + 1} / {selectedDeck.cards.length}
                </span>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 flex items-center justify-center border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] rounded-full transition-all text-lg font-bold shadow-xs active:scale-95"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Browse Decks list */}
        {activeTab === 'browse' && !selectedDeck && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between h-44 animate-pulse">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-1/3 bg-[var(--surface-2)] rounded" />
                    <div className="h-6 w-3/4 bg-[var(--surface-3)] rounded" />
                  </div>
                  <div className="h-10 w-full bg-[var(--surface-2)] rounded" />
                </div>
              ))
            ) : decks.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
                <span className="text-5xl mb-4 select-none">🎴</span>
                <h3 className="text-lg font-black text-[var(--text-primary)]">No flashcard sets yet</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm">
                  Generate your first set using AI by topic, subject, or by summarizing any textbook PDF.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-6 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Create AI Deck
                </button>
              </div>
            ) : (
              decks.map((deck) => (
                <div
                  key={deck._id}
                  onClick={() => {
                    setSelectedDeck(deck)
                    setCurrentCardIndex(0)
                    setIsFlipped(false)
                  }}
                  className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between h-44 hover:border-[var(--border-strong)] transition-all hover:scale-[1.01] cursor-pointer shadow-[var(--shadow-card)] relative group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 text-[9px] font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-full capitalize">
                        {deck.subject}
                      </span>
                      <button
                        onClick={(e) => handleDeleteDeck(deck._id, e)}
                        className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete deck"
                      >
                        🗑
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-3 line-clamp-2 capitalize">
                      {deck.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-secondary)] font-semibold mt-4">
                    <span>{deck.cards?.length || 0} cards</span>
                    <span className="text-[var(--primary)] group-hover:translate-x-0.5 transition-transform">
                      Study Now →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 3: Create AI Deck Form */}
        {activeTab === 'create' && !selectedDeck && (
          <div className="max-w-xl mx-auto bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] p-6 sm:p-8">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span>🪄</span> AI Flashcard Generator
            </h2>

            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g. computer science, biology, chemistry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={generating}
                  className="px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface-1)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
                />
              </div>

              {/* Topic */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Topic or Concept Description *
                </label>
                <textarea
                  placeholder="Describe the specific topic (e.g. database scaling, mitosis steps, active transport)."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                  rows={3}
                  className="px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface-1)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] resize-none"
                />
              </div>

              {/* Cards Count */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Number of Cards ({count})
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={generating}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] px-1">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                </div>
              </div>

              {/* Reference Document */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Reference Study File (Optional)
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
                    📁 Select Study Document
                  </button>
                )}
                <span className="text-[10px] text-[var(--text-tertiary)] italic leading-normal">
                  If selected, Jarvis will parse the file content and base all flashcards exactly on the document text.
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
                    <span className="spinner text-[var(--text-inverse)]" /> Generating Flashcards...
                  </>
                ) : (
                  <>🪄 Generate Flashcards</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Picker Modal */}
      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectResource}
        selectedId={attachedResource?._id}
      />
    </div>
  )
}
