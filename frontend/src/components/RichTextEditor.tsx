'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered } from 'lucide-react'
import styles from './RichTextEditor.module.css'

interface RichTextEditorProps {
  value: string
  onChange: (html: string, text: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write your email here...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize value only once on mount to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '' && value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    editorRef.current?.focus()
    handleInput()
  }

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      const text = editorRef.current.innerText || editorRef.current.textContent || ''
      onChange(html, text)
    }
  }

  const addLink = () => {
    const url = prompt('Enter link URL:')
    if (url) {
      handleCommand('createLink', url)
    }
  }

  return (
    <div className={`${styles.editorContainer} ${isFocused ? styles.focused : ''}`}>
      <div className={styles.toolbar}>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleCommand('bold')} className={styles.toolbarBtn} title="Bold" aria-label="Bold">
          <Bold size={16} />
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleCommand('italic')} className={styles.toolbarBtn} title="Italic" aria-label="Italic">
          <Italic size={16} />
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleCommand('underline')} className={styles.toolbarBtn} title="Underline" aria-label="Underline">
          <Underline size={16} />
        </button>
        <div className={styles.divider} />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleCommand('insertUnorderedList')} className={styles.toolbarBtn} title="Bullet List" aria-label="Bullet list">
          <List size={16} />
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleCommand('insertOrderedList')} className={styles.toolbarBtn} title="Numbered List" aria-label="Numbered list">
          <ListOrdered size={16} />
        </button>
        <div className={styles.divider} />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className={styles.toolbarBtn} title="Insert Link" aria-label="Insert link">
          <LinkIcon size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.editorArea}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />
    </div>
  )
}
