'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import styles from './compose.module.css'
import RichTextEditor from '@/components/RichTextEditor'

interface ComposeClientFormProps {
  userEmailId: string
  sendMessage: (formData: FormData) => Promise<void>
  initialTo?: string
  initialSubject?: string
  initialBody?: string
}

export default function ComposeClientForm({
  userEmailId,
  sendMessage,
  initialTo = '',
  initialSubject = '',
  initialBody = ''
}: ComposeClientFormProps) {
  const [htmlContent, setHtmlContent] = useState(initialBody)
  const [textContent, setTextContent] = useState(initialBody)

  return (
    <form className={styles.form} action={sendMessage}>
      <input type="hidden" name="from" value={userEmailId} />
      {/* Hidden inputs to pass the rich text data to the Server Action */}
      <input type="hidden" name="body" value={textContent} />
      <input type="hidden" name="body_html" value={htmlContent} />



      <div className={styles.inputGroup}>
        <label htmlFor="to">To:</label>
        <input
          type="text"
          id="to"
          name="to"
          placeholder="Phone number or email address"
          defaultValue={initialTo}
          required
          className={styles.input}
          autoFocus
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Email subject..."
          defaultValue={initialSubject}
          className={styles.input}
        />
      </div>

      <div className={styles.editorArea}>
        <RichTextEditor
          value={initialBody}
          onChange={(html, text) => {
            setHtmlContent(html)
            setTextContent(text)
          }}
          placeholder="Write your email here..."
        />
      </div>

      <button type="submit" className={styles.sendFab} aria-label="Send Email">
        <Send size={22} />
      </button>
    </form>
  )
}
