import React from 'react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  // Standard simple markdown-like formatter for code blocks, lists, bold text, headers
  const formatContent = (text) => {
    if (!text) return ''

    const lines = text.split('\n')
    const formattedElements = []
    let inCodeBlock = false
    let codeBlockContent = []
    let codeBlockLang = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code Block Start/End
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close block
          formattedElements.push(
            <pre key={`code-${i}`} className="my-3 p-4 bg-[var(--surface-3)] border border-[var(--border)] rounded-xl overflow-x-auto text-xs font-mono text-[var(--text-primary)]">
              {codeBlockContent.join('\n')}
            </pre>
          )
          codeBlockContent = []
          inCodeBlock = false
        } else {
          // Open block
          inCodeBlock = true
          codeBlockLang = line.replace('```', '').trim()
        }
        continue
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        continue
      }

      // Headers (e.g. ### Header)
      if (line.trim().startsWith('### ')) {
        formattedElements.push(
          <h4 key={i} className="text-sm font-bold text-[var(--text-primary)] mt-4 mb-2">
            {parseInlineMarkdown(line.substring(4))}
          </h4>
        )
        continue
      }
      if (line.trim().startsWith('## ')) {
        formattedElements.push(
          <h3 key={i} className="text-base font-bold text-[var(--text-primary)] mt-5 mb-2 border-b border-[var(--border)] pb-1">
            {parseInlineMarkdown(line.substring(3))}
          </h3>
        )
        continue
      }
      if (line.trim().startsWith('# ')) {
        formattedElements.push(
          <h2 key={i} className="text-lg font-bold text-[var(--text-primary)] mt-6 mb-3">
            {parseInlineMarkdown(line.substring(2))}
          </h2>
        )
        continue
      }

      // Unordered Lists (e.g. - item or * item)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        formattedElements.push(
          <li key={i} className="ml-4 list-disc text-sm text-[var(--text-primary)] mb-1">
            {parseInlineMarkdown(line.trim().substring(2))}
          </li>
        )
        continue
      }

      // Numbered Lists (e.g. 1. item)
      const numListMatch = line.trim().match(/^(\d+)\.\s(.*)/)
      if (numListMatch) {
        formattedElements.push(
          <li key={i} className="ml-4 list-decimal text-sm text-[var(--text-primary)] mb-1">
            {parseInlineMarkdown(numListMatch[2])}
          </li>
        )
        continue
      }

      // Blockquote
      if (line.trim().startsWith('> ')) {
        formattedElements.push(
          <blockquote key={i} className="border-l-4 border-[var(--border-strong)] pl-3 py-1 my-2 text-xs italic text-[var(--text-secondary)]">
            {parseInlineMarkdown(line.trim().substring(2))}
          </blockquote>
        )
        continue
      }

      // Regular line (or blank spacing)
      if (line.trim() === '') {
        formattedElements.push(<div key={i} className="h-2" />)
      } else {
        formattedElements.push(
          <p key={i} className="text-sm text-[var(--text-primary)] leading-relaxed mb-1.5">
            {parseInlineMarkdown(line)}
          </p>
        )
      }
    }

    return formattedElements
  }

  // Parses bold (**), italics (*), inline code (`)
  const parseInlineMarkdown = (text) => {
    // Escape standard regex characters if any
    const parts = []
    let currentText = text
    let index = 0

    // Match bold (**text**) or inline code (`code`)
    while (currentText.length > 0) {
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/)
      const codeMatch = currentText.match(/`(.*?)`/)

      // Find first occurrence
      let firstMatch = null
      let type = '' // 'bold', 'code'

      if (boldMatch && (!codeMatch || boldMatch.index < codeMatch.index)) {
        firstMatch = boldMatch
        type = 'bold'
      } else if (codeMatch) {
        firstMatch = codeMatch
        type = 'code'
      }

      if (!firstMatch) {
        parts.push(<span key={index++}>{currentText}</span>)
        break
      }

      // Add text before match
      if (firstMatch.index > 0) {
        parts.push(<span key={index++}>{currentText.substring(0, firstMatch.index)}</span>)
      }

      // Add matched node
      if (type === 'bold') {
        parts.push(<strong key={index++} className="font-semibold text-[var(--text-primary)]">{firstMatch[1]}</strong>)
      } else if (type === 'code') {
        parts.push(
          <code key={index++} className="px-1.5 py-0.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-md font-mono text-xs text-[var(--text-primary)]">
            {firstMatch[1]}
          </code>
        )
      }

      currentText = currentText.substring(firstMatch.index + firstMatch[0].length)
    }

    return parts
  }

  return (
    <div className={`flex w-full gap-3 py-4 border-b border-[var(--border)] px-4 sm:px-6 transition-all animate-[fadeIn_0.2s_ease-out] ${
      isUser ? 'bg-[var(--card-bg)]' : 'bg-[var(--surface-1)]'
    }`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
        isUser
          ? 'bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm'
          : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
      }`}>
        {isUser ? 'U' : '🤖'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {isUser ? 'You' : 'Jarvis'}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <div className="space-y-1 pr-2">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  )
}
