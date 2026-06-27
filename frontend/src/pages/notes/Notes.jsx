import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useNotes from '../../hooks/useNotes'
import NoteCard from '../../components/notes/NoteCard'
import NoteModal from '../../components/notes/NoteModal'
import SearchBar from '../../components/notes/SearchBar'
import TagFilter from '../../components/notes/TagFilter'

function CardSkeleton() {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 animate-pulse h-48 justify-between">
      <div className="flex flex-col gap-2.5">
        <div className="h-3 w-1/4 bg-[var(--surface-2)] rounded" />
        <div className="h-5 w-3/4 bg-[var(--surface-3)] rounded" />
        <div className="h-3 w-5/6 bg-[var(--surface-2)] rounded" />
        <div className="h-3 w-4/6 bg-[var(--surface-2)] rounded" />
      </div>
      <div className="flex justify-between items-center border-t border-[var(--border)] pt-3.5">
        <div className="h-3 w-1/3 bg-[var(--surface-2)] rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-[var(--surface-2)] rounded" />
          <div className="h-6 w-6 bg-[var(--surface-2)] rounded" />
          <div className="h-6 w-6 bg-[var(--surface-2)] rounded" />
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, emoji }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-sm)]">
      <span className="text-xl bg-[var(--surface-2)] w-10 h-10 rounded-lg flex items-center justify-center">{emoji}</span>
      <div>
        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">{label}</p>
        <p className="text-lg font-bold text-[var(--text-primary)] leading-none mt-1">{value}</p>
      </div>
    </div>
  )
}

export default function Notes() {
  const navigate = useNavigate()

  const {
    notes,
    pagination,
    stats,
    tags,
    loading,
    statsLoading,
    submitting,
    error,
    clearError,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    showArchived,
    setShowArchived,
    page,
    setPage,
    handleCreateNote,
    handleUpdateNote,
    handleTogglePin,
    handleToggleArchive,
    handleDeleteNote,
  } = useNotes()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [localError, setLocalError] = useState('')

  const handleOpenCreateModal = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleSaveNote = async (noteData) => {
    setLocalError('')
    try {
      if (editingNote) {
        await handleUpdateNote(editingNote._id, noteData)
      } else {
        await handleCreateNote(noteData)
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to save note')
      throw err
    }
  }

  const handleTogglePinAction = async (id) => {
    try {
      await handleTogglePin(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to toggle pin')
    }
  }

  const handleToggleArchiveAction = async (id) => {
    try {
      await handleToggleArchive(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to toggle archive')
    }
  }

  const handleDeleteNoteAction = async (id) => {
    try {
      await handleDeleteNote(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to delete note')
    }
  }

  // Filter notes into pinned and unpinned lists
  const pinnedNotes = notes.filter(n => n.isPinned)
  const regularNotes = notes.filter(n => !n.isPinned)

  const activeError = error || localError

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back link & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Notes Hub 📝</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Capture your thoughts, ideas, and lecture courses notes.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start sm:self-center px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>➕</span> New Note
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem label="Total Notes" value={statsLoading ? '...' : stats.totalNotes} emoji="📓" />
        <StatItem label="Pinned" value={statsLoading ? '...' : stats.pinnedNotes} emoji="📌" />
        <StatItem label="Archived" value={statsLoading ? '...' : stats.archivedNotes} emoji="📁" />
        <StatItem label="Unique Tags" value={statsLoading ? '...' : stats.totalTags} emoji="🏷️" />
      </div>

      {/* Error Banner */}
      {activeError && (
        <div className="bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] px-5 py-3 rounded-xl text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            {activeError}
          </span>
          <button
            onClick={() => {
              setLocalError('')
              if (error) clearError()
            }}
            className="text-[var(--danger-text)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter / Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 mt-2">
        {/* Active vs Archived tabs */}
        <div className="flex bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1 self-start">
          <button
            onClick={() => {
              setShowArchived(false)
              setSelectedTag(null)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              !showArchived
                ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            📥 Notes
          </button>
          <button
            onClick={() => {
              setShowArchived(true)
              setSelectedTag(null)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              showArchived
                ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            📁 Archive
          </button>
        </div>

        {/* SearchBar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Tag Filters list */}
      {tags.length > 0 && (
        <TagFilter tags={tags} activeTag={selectedTag} onSelectTag={setSelectedTag} />
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        /* Empty States */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl gap-4 mt-2">
          <div className="text-5xl">🏜️</div>
          {searchQuery || selectedTag ? (
            <>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No results found</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">No notes match your active search terms or tag filters. Try clearing them.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTag(null)
                }}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </>
          ) : showArchived ? (
            <>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Archive is empty</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">Notes you archive will appear here.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No notes yet</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">Start capturing your lecture notes, todo lists, and thoughts.</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Create Your First Note
              </button>
            </>
          )}
        </div>
      ) : (
        /* Notes Render */
        <div className="flex flex-col gap-6 mt-2">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span>📌</span> Pinned Notes ({pinnedNotes.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteNoteAction}
                    onTogglePin={handleTogglePinAction}
                    onToggleArchive={handleToggleArchiveAction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unpinned / regular section */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 mt-4">
                  📝 Other Notes ({regularNotes.length})
                </h4>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteNoteAction}
                    onTogglePin={handleTogglePinAction}
                    onToggleArchive={handleToggleArchiveAction}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-[var(--text-primary)]"
          >
            Previous
          </button>
          <span className="text-xs text-[var(--text-secondary)]">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            disabled={page === pagination.pages}
            className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-[var(--text-primary)]"
          >
            Next
          </button>
        </div>
      )}

      {/* Note modal overlay */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        submitting={submitting}
      />
    </div>
  )
}
