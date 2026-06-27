import React, { useState, useRef, useEffect } from 'react'
import useJarvisChat from '../../hooks/useJarvisChat'
import ConversationSidebar from './ConversationSidebar'
import ResourcePicker from './ResourcePicker'

// ── Inline markdown renderer ───────────────────────────────────────────────
function MarkdownRenderer({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeLang = ''
  let codeLines = []
  let inList = false
  let listItems = []
  let listType = null

  const flushList = (key) => {
    if (!listItems.length) return
    if (listType === 'ol') {
      elements.push(
        <ol key={`ol-${key}`} className="jarvis-ol">
          {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ol>
      )
    } else {
      elements.push(
        <ul key={`ul-${key}`} className="jarvis-ul">
          {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ul>
      )
    }
    listItems = []
    listType = null
    inList = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const lang = codeLang
        const code = codeLines.join('\n')
        elements.push(
          <div key={`cb-${i}`} className="jarvis-code-block">
            {lang && <div className="jarvis-code-lang">{lang}</div>}
            <button
              className="jarvis-copy-btn"
              onClick={() => navigator.clipboard.writeText(code)}
              title="Copy code"
            >
              📋 Copy
            </button>
            <pre><code>{code}</code></pre>
          </div>
        )
        codeLines = []
        inCodeBlock = false
        codeLang = ''
      } else {
        flushList(i)
        inCodeBlock = true
        codeLang = line.replace('```', '').trim()
      }
      continue
    }

    if (inCodeBlock) { codeLines.push(line); continue }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushList(i)
      elements.push(<hr key={`hr-${i}`} className="jarvis-hr" />)
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList(i)
      elements.push(<h4 key={i} className="jarvis-h4">{parseInline(line.slice(4))}</h4>)
      continue
    }
    if (line.startsWith('## ')) {
      flushList(i)
      elements.push(<h3 key={i} className="jarvis-h3">{parseInline(line.slice(3))}</h3>)
      continue
    }
    if (line.startsWith('# ')) {
      flushList(i)
      elements.push(<h2 key={i} className="jarvis-h2">{parseInline(line.slice(2))}</h2>)
      continue
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      flushList(i)
      elements.push(
        <blockquote key={i} className="jarvis-blockquote">{parseInline(line.trim().slice(2))}</blockquote>
      )
      continue
    }

    // Lists
    const ulMatch = line.match(/^(\s*)([-*])\s(.+)/)
    const olMatch = line.match(/^(\s*)\d+\.\s(.+)/)
    if (ulMatch) {
      if (!inList || listType !== 'ul') { flushList(i); inList = true; listType = 'ul' }
      listItems.push(ulMatch[3])
      continue
    }
    if (olMatch) {
      if (!inList || listType !== 'ol') { flushList(i); inList = true; listType = 'ol' }
      listItems.push(olMatch[2])
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushList(i)
      elements.push(<div key={i} className="jarvis-spacer" />)
      continue
    }

    // Paragraph
    flushList(i)
    elements.push(<p key={i} className="jarvis-p">{parseInline(line)}</p>)
  }

  flushList('end')

  return <div className="jarvis-md">{elements}</div>
}

function parseInline(text) {
  const parts = []
  let remaining = text
  let idx = 0

  while (remaining.length > 0) {
    const boldM = remaining.match(/\*\*(.*?)\*\*/)
    const italM = remaining.match(/\*(.*?)\*/)
    const codeM = remaining.match(/`(.*?)`/)

    const candidates = [boldM, italM, codeM].filter(Boolean)
    if (!candidates.length) {
      parts.push(<span key={idx++}>{remaining}</span>)
      break
    }

    const first = candidates.reduce((a, b) => a.index <= b.index ? a : b)
    if (first.index > 0) {
      parts.push(<span key={idx++}>{remaining.substring(0, first.index)}</span>)
    }

    if (first === boldM) {
      parts.push(<strong key={idx++} className="jarvis-bold">{first[1]}</strong>)
    } else if (first === italM) {
      parts.push(<em key={idx++} className="jarvis-italic">{first[1]}</em>)
    } else {
      parts.push(<code key={idx++} className="jarvis-inline-code">{first[1]}</code>)
    }

    remaining = remaining.substring(first.index + first[0].length)
  }

  return parts
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="jarvis-msg-copy" title="Copy message">
      {copied ? '✓' : '⧉'}
    </button>
  )
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`jarvis-msg-row ${isUser ? 'jarvis-msg-user' : 'jarvis-msg-bot'}`}>
      <div className={`jarvis-avatar ${isUser ? 'jarvis-avatar-user' : 'jarvis-avatar-bot'}`}>
        {isUser ? 'U' : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>

      <div className="jarvis-msg-content">
        <div className="jarvis-msg-header">
          <span className="jarvis-msg-name">{isUser ? 'You' : 'Jarvis'}</span>
          {time && <span className="jarvis-msg-time">{time}</span>}
          <CopyButton text={message.content} />
        </div>
        {isUser
          ? <p className="jarvis-p">{message.content}</p>
          : <MarkdownRenderer content={message.content} />
        }
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div className="jarvis-msg-row jarvis-msg-bot">
      <div className="jarvis-avatar jarvis-avatar-bot">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="jarvis-msg-content">
        <div className="jarvis-msg-header">
          <span className="jarvis-msg-name">Jarvis</span>
        </div>
        <div className="jarvis-thinking">
          <span className="jarvis-dot" />
          <span className="jarvis-dot" />
          <span className="jarvis-dot" />
          <span className="jarvis-thinking-label">Thinking…</span>
        </div>
      </div>
    </div>
  )
}

// ── Welcome screen suggestion cards ──────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '💡', text: 'Explain Database Normalization with an analogy' },
  { icon: '⚡', text: 'How do I optimize a binary search algorithm?' },
  { icon: '📖', text: 'Summarize the key concepts of Operating Systems' },
  { icon: '🌱', text: 'Give me 3 tips to manage exam stress effectively' },
]

function WelcomeScreen({ onSuggest }) {
  return (
    <div className="jarvis-welcome">
      <div className="jarvis-welcome-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h2 className="jarvis-welcome-title">Meet Jarvis</h2>
      <p className="jarvis-welcome-sub">
        Your AI-powered academic assistant. Ask questions, summarize resources, generate flashcards or quizzes — powered by Google Gemini.
      </p>
      <div className="jarvis-suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="jarvis-suggestion-card" onClick={() => onSuggest(s.text)}>
            <span className="jarvis-suggestion-icon">{s.icon}</span>
            <span className="jarvis-suggestion-text">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Chat input bar ────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled, attachedResource, onAttachClick, onRemoveResource }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="jarvis-input-wrap">
      {attachedResource && (
        <div className="jarvis-resource-pill">
          <span className="jarvis-resource-pill-icon">📄</span>
          <span className="jarvis-resource-pill-name">{attachedResource.title}</span>
          <button className="jarvis-resource-pill-remove" onClick={onRemoveResource} title="Remove resource">×</button>
        </div>
      )}
      <div className="jarvis-input-bar">
        <button className="jarvis-attach-btn" onClick={onAttachClick} title="Attach study resource" disabled={disabled}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <textarea
          ref={textareaRef}
          className="jarvis-textarea"
          placeholder="Ask Jarvis anything… (Shift+Enter for new line)"
          value={value}
          onChange={e => { setValue(e.target.value); autoResize() }}
          onKeyDown={handleKey}
          disabled={disabled}
          rows={1}
        />
        <button
          className={`jarvis-send-btn ${(!value.trim() || disabled) ? 'jarvis-send-disabled' : ''}`}
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          title="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <p className="jarvis-input-hint">Powered by Google Gemini 2.0 Flash · Press Enter to send · Shift+Enter for newline</p>
    </div>
  )
}

// ── Main JarvisPage ───────────────────────────────────────────────────────────
export default function JarvisPage() {
  const {
    sessions,
    activeSession,
    messages,
    loading,
    error,
    attachedResource,
    setAttachedResource,
    loadSession,
    startNewSession,
    deleteSession,
    sendMessage
  } = useJarvisChat()

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const feedRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSelectResource = (resource) => {
    setAttachedResource(resource)
    setIsPickerOpen(false)
  }

  return (
    <>
      {/* Global styles for Jarvis */}
      <style>{JARVIS_STYLES}</style>

      <div className="jarvis-root">
        {/* ── Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div className="jarvis-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Left Sidebar */}
        <aside className={`jarvis-sidebar ${sidebarOpen ? 'jarvis-sidebar-open' : ''}`}>
          <div className="jarvis-sidebar-header">
            <div className="jarvis-sidebar-brand">
              <div className="jarvis-brand-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span>Jarvis AI</span>
            </div>
            <button
              className="jarvis-new-chat-btn"
              onClick={() => { startNewSession('New Chat'); setSidebarOpen(false) }}
              title="New conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div className="jarvis-sidebar-sessions">
            {sessions.length === 0 ? (
              <p className="jarvis-no-sessions">No conversations yet</p>
            ) : (
              sessions.map(s => (
                <button
                  key={s._id}
                  className={`jarvis-session-item ${activeSession?._id === s._id ? 'jarvis-session-active' : ''}`}
                  onClick={() => { loadSession(s._id); setSidebarOpen(false) }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="jarvis-session-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="jarvis-session-title">{s.title}</span>
                  <button
                    className="jarvis-session-delete"
                    onClick={e => { e.stopPropagation(); deleteSession(s._id) }}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                </button>
              ))
            )}
          </div>

          <div className="jarvis-sidebar-footer">
            <div className="jarvis-powered-badge">
              <span>⚡</span>
              <span>Gemini 2.0 Flash</span>
            </div>
          </div>
        </aside>

        {/* ── Main Chat Area */}
        <main className="jarvis-main">
          {/* Top Bar */}
          <header className="jarvis-topbar">
            <div className="jarvis-topbar-left">
              <button className="jarvis-hamburger" onClick={() => setSidebarOpen(s => !s)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <div className="jarvis-topbar-info">
                <div className="jarvis-topbar-title-row">
                  <span className="jarvis-topbar-name">{activeSession?.title || 'Jarvis Assistant'}</span>
                  <span className="jarvis-gemini-badge">Gemini</span>
                </div>
                <span className="jarvis-topbar-sub">
                  {attachedResource ? `📎 ${attachedResource.title}` : 'General academic assistant'}
                </span>
              </div>
            </div>
            <div className="jarvis-topbar-actions">
              {attachedResource && (
                <button
                  className="jarvis-clear-context"
                  onClick={() => setAttachedResource(null)}
                >
                  Clear Context
                </button>
              )}
              <button
                className="jarvis-new-chat-top"
                onClick={() => startNewSession('New Chat')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                New Chat
              </button>
            </div>
          </header>

          {/* Messages Feed */}
          <div className="jarvis-feed" ref={feedRef}>
            {messages.length === 0 && !loading ? (
              <WelcomeScreen onSuggest={sendMessage} />
            ) : (
              <div className="jarvis-messages">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {loading && <ThinkingIndicator />}
                {error && (
                  <div className="jarvis-error-banner">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <ChatInput
            onSend={sendMessage}
            disabled={loading}
            attachedResource={attachedResource}
            onAttachClick={() => setIsPickerOpen(true)}
            onRemoveResource={() => setAttachedResource(null)}
          />
        </main>
      </div>

      {/* Resource Picker Modal */}
      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectResource}
        selectedId={attachedResource?._id}
      />
    </>
  )
}

// ── All Jarvis-specific styles ────────────────────────────────────────────────
const JARVIS_STYLES = `
  .jarvis-root {
    display: flex;
    height: calc(100vh - 64px);
    overflow: hidden;
    background: var(--bg-app, #0a0a0a);
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }

  /* ── Sidebar ── */
  .jarvis-sidebar {
    width: 260px;
    min-width: 260px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #111111;
    border-right: 1px solid #222;
    transition: transform 0.25s ease;
    z-index: 30;
  }

  .jarvis-sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 29;
    backdrop-filter: blur(2px);
  }

  .jarvis-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid #1e1e1e;
  }

  .jarvis-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.01em;
  }

  .jarvis-brand-icon {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .jarvis-new-chat-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    background: #1a1a1a;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .jarvis-new-chat-btn:hover {
    background: #222;
    color: #fff;
    border-color: #3a3a3a;
  }

  .jarvis-sidebar-sessions {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .jarvis-sidebar-sessions::-webkit-scrollbar { width: 4px; }
  .jarvis-sidebar-sessions::-webkit-scrollbar-track { background: transparent; }
  .jarvis-sidebar-sessions::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  .jarvis-no-sessions {
    font-size: 12px;
    color: #555;
    text-align: center;
    padding: 24px 0;
    margin: 0;
  }

  .jarvis-session-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #888;
    cursor: pointer;
    text-align: left;
    font-size: 12px;
    transition: all 0.15s;
    position: relative;
  }

  .jarvis-session-item:hover {
    background: #1a1a1a;
    color: #ccc;
  }

  .jarvis-session-active {
    background: #1e1e2e !important;
    color: #a5b4fc !important;
    border: 1px solid #3730a3;
  }

  .jarvis-session-icon { flex-shrink: 0; opacity: 0.5; }
  .jarvis-session-active .jarvis-session-icon { opacity: 1; }

  .jarvis-session-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }

  .jarvis-session-delete {
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    color: #555;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .jarvis-session-item:hover .jarvis-session-delete { opacity: 1; }
  .jarvis-session-delete:hover { background: #3a1010; color: #f87171; }

  .jarvis-sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid #1e1e1e;
  }

  .jarvis-powered-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #444;
  }

  /* ── Main area ── */
  .jarvis-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #0d0d0d;
    min-width: 0;
  }

  /* ── Top bar ── */
  .jarvis-topbar {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #1a1a1a;
    background: #0d0d0d;
    flex-shrink: 0;
  }

  .jarvis-topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .jarvis-hamburger {
    width: 34px;
    height: 34px;
    border: 1px solid #222;
    border-radius: 8px;
    background: #1a1a1a;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
    display: none;
  }

  .jarvis-hamburger:hover { background: #222; color: #fff; }

  .jarvis-topbar-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .jarvis-topbar-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .jarvis-topbar-name {
    font-size: 14px;
    font-weight: 700;
    color: #e5e5e5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }

  .jarvis-gemini-badge {
    font-size: 10px;
    font-weight: 600;
    color: #6366f1;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 20px;
    padding: 1px 8px;
    flex-shrink: 0;
    letter-spacing: 0.03em;
  }

  .jarvis-topbar-sub {
    font-size: 11px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .jarvis-topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .jarvis-clear-context {
    height: 30px;
    padding: 0 12px;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    background: #1a1a1a;
    color: #f87171;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .jarvis-clear-context:hover { background: #3a1010; border-color: #7f1d1d; }

  .jarvis-new-chat-top {
    height: 30px;
    padding: 0 12px;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    background: #1a1a1a;
    color: #888;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s;
  }

  .jarvis-new-chat-top:hover { background: #222; color: #fff; border-color: #333; }

  /* ── Messages feed ── */
  .jarvis-feed {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scroll-behavior: smooth;
  }

  .jarvis-feed::-webkit-scrollbar { width: 6px; }
  .jarvis-feed::-webkit-scrollbar-track { background: transparent; }
  .jarvis-feed::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }

  .jarvis-messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
  }

  /* ── Message row ── */
  .jarvis-msg-row {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-radius: 0;
    transition: background 0.1s;
    position: relative;
    animation: jarvisFadeIn 0.2s ease-out;
  }

  @keyframes jarvisFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .jarvis-msg-user { background: transparent; }
  .jarvis-msg-bot { background: rgba(255,255,255,0.02); }
  .jarvis-msg-row:hover .jarvis-msg-copy { opacity: 1; }

  /* ── Avatar ── */
  .jarvis-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .jarvis-avatar-user {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    color: #e5e5e5;
    border: 1px solid #374151;
  }

  .jarvis-avatar-bot {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #fff;
    box-shadow: 0 2px 12px rgba(99,102,241,0.3);
  }

  /* ── Message content ── */
  .jarvis-msg-content { flex: 1; min-width: 0; }

  .jarvis-msg-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .jarvis-msg-name { font-size: 13px; font-weight: 700; color: #d1d5db; }
  .jarvis-msg-time { font-size: 11px; color: #444; }

  .jarvis-msg-copy {
    width: 24px;
    height: 24px;
    border: 1px solid #2a2a2a;
    border-radius: 5px;
    background: #1a1a1a;
    color: #555;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.15s;
    margin-left: auto;
  }

  .jarvis-msg-copy:hover { background: #222; color: #fff; border-color: #333; }

  /* ── Thinking indicator ── */
  .jarvis-thinking {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 0;
  }

  .jarvis-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6366f1;
    animation: jarvisPulse 1.4s ease-in-out infinite;
  }

  .jarvis-dot:nth-child(2) { animation-delay: 0.2s; }
  .jarvis-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes jarvisPulse {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  .jarvis-thinking-label {
    font-size: 12px;
    color: #555;
    margin-left: 4px;
    font-style: italic;
  }

  /* ── Error banner ── */
  .jarvis-error-banner {
    margin: 12px 24px;
    padding: 12px 16px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #fca5a5;
  }

  /* ── Welcome screen ── */
  .jarvis-welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
    max-width: 640px;
    margin: 0 auto;
    width: 100%;
    animation: jarvisFadeIn 0.3s ease-out;
  }

  .jarvis-welcome-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
    margin-bottom: 20px;
    box-shadow: 0 0 40px rgba(99,102,241,0.1);
  }

  .jarvis-welcome-title {
    font-size: 26px;
    font-weight: 800;
    color: #e5e5e5;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
  }

  .jarvis-welcome-sub {
    font-size: 14px;
    color: #555;
    margin: 0 0 32px;
    line-height: 1.7;
    max-width: 480px;
  }

  .jarvis-suggestions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
  }

  .jarvis-suggestion-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid #1e1e1e;
    border-radius: 12px;
    background: #111;
    color: #888;
    cursor: pointer;
    text-align: left;
    font-size: 12.5px;
    line-height: 1.5;
    transition: all 0.2s;
  }

  .jarvis-suggestion-card:hover {
    background: #1a1a1a;
    border-color: #333;
    color: #ccc;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .jarvis-suggestion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .jarvis-suggestion-text { flex: 1; }

  /* ── Input wrap ── */
  .jarvis-input-wrap {
    padding: 12px 20px 16px;
    background: #0d0d0d;
    border-top: 1px solid #1a1a1a;
    flex-shrink: 0;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .jarvis-resource-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 20px;
    font-size: 11.5px;
    color: #a5b4fc;
    margin-bottom: 8px;
    max-width: 300px;
  }

  .jarvis-resource-pill-icon { font-size: 13px; }
  .jarvis-resource-pill-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .jarvis-resource-pill-remove {
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: #6366f1;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .jarvis-resource-pill-remove:hover { color: #f87171; }

  .jarvis-input-bar {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #151515;
    border: 1px solid #222;
    border-radius: 14px;
    padding: 8px 10px 8px 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .jarvis-input-bar:focus-within {
    border-color: #3730a3;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .jarvis-attach-btn {
    width: 34px;
    height: 34px;
    border: none;
    background: transparent;
    color: #555;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .jarvis-attach-btn:hover:not(:disabled) { background: #222; color: #888; }
  .jarvis-attach-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .jarvis-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e5e5e5;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    padding: 4px 0;
    min-height: 26px;
    max-height: 160px;
    overflow-y: auto;
  }

  .jarvis-textarea::placeholder { color: #444; }
  .jarvis-textarea::-webkit-scrollbar { width: 3px; }
  .jarvis-textarea::-webkit-scrollbar-thumb { background: #333; }

  .jarvis-send-btn {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
    box-shadow: 0 2px 12px rgba(99,102,241,0.3);
  }

  .jarvis-send-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(99,102,241,0.5);
  }

  .jarvis-send-disabled {
    background: #1a1a1a !important;
    box-shadow: none !important;
    color: #333 !important;
    cursor: not-allowed !important;
    transform: none !important;
  }

  .jarvis-input-hint {
    font-size: 10.5px;
    color: #333;
    text-align: center;
    margin: 6px 0 0;
  }

  /* ── Markdown styles ── */
  .jarvis-md { color: #c9d1d9; font-size: 14px; line-height: 1.75; }

  .jarvis-p {
    margin: 0 0 10px;
    color: #c9d1d9;
    font-size: 14px;
    line-height: 1.75;
  }

  .jarvis-p:last-child { margin-bottom: 0; }

  .jarvis-h2 {
    font-size: 18px;
    font-weight: 800;
    color: #e5e5e5;
    margin: 20px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #1e1e1e;
    letter-spacing: -0.01em;
  }

  .jarvis-h3 {
    font-size: 15px;
    font-weight: 700;
    color: #d1d5db;
    margin: 16px 0 8px;
  }

  .jarvis-h4 {
    font-size: 13px;
    font-weight: 700;
    color: #9ca3af;
    margin: 12px 0 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .jarvis-ul, .jarvis-ol {
    margin: 4px 0 10px;
    padding-left: 20px;
    color: #c9d1d9;
  }

  .jarvis-ul li, .jarvis-ol li {
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 4px;
  }

  .jarvis-blockquote {
    border-left: 3px solid #374151;
    padding: 8px 16px;
    margin: 10px 0;
    color: #6b7280;
    font-style: italic;
    font-size: 13px;
    background: rgba(255,255,255,0.02);
    border-radius: 0 8px 8px 0;
  }

  .jarvis-hr {
    border: none;
    border-top: 1px solid #1e1e1e;
    margin: 16px 0;
  }

  .jarvis-bold { font-weight: 700; color: #e5e5e5; }
  .jarvis-italic { font-style: italic; color: #9ca3af; }

  .jarvis-inline-code {
    padding: 2px 6px;
    background: #1a1a2e;
    border: 1px solid #2d2d44;
    border-radius: 5px;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12.5px;
    color: #a5b4fc;
  }

  .jarvis-code-block {
    position: relative;
    margin: 12px 0;
    background: #111;
    border: 1px solid #222;
    border-radius: 10px;
    overflow: hidden;
  }

  .jarvis-code-lang {
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #555;
    background: #0d0d0d;
    border-bottom: 1px solid #1a1a1a;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .jarvis-code-block pre {
    margin: 0;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.6;
    font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
    color: #c9d1d9;
  }

  .jarvis-code-block pre::-webkit-scrollbar { height: 4px; }
  .jarvis-code-block pre::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  .jarvis-copy-btn {
    position: absolute;
    top: 6px;
    right: 8px;
    padding: 4px 10px;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    background: #1a1a1a;
    color: #666;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .jarvis-copy-btn:hover { background: #222; color: #fff; border-color: #333; }

  .jarvis-spacer { height: 6px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .jarvis-sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      height: calc(100% - 64px);
      transform: translateX(-100%);
    }
    .jarvis-sidebar-open {
      transform: translateX(0);
    }
    .jarvis-sidebar-overlay {
      display: block;
    }
    .jarvis-hamburger { display: flex !important; }
    .jarvis-suggestions { grid-template-columns: 1fr; }
    .jarvis-msg-row { padding: 12px 14px; }
  }
`
