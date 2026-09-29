'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Send } from 'lucide-react'
import styles from './compose.module.css'
import RichTextEditor from '@/components/RichTextEditor'

function SendButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className={styles.sendFab} disabled={pending}>
      <Send size={17} />
      <span>{pending ? 'Sending…' : 'Send message'}</span>
    </button>
  )
}

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
          placeholder="Name, phone number or email address"
          defaultValue={initialTo}
          required
          className={styles.input}
          autoFocus
          autoComplete="email"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Add a subject"
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

      <div className={styles.formActions}>
        <span className={styles.composeNote}>A clear subject helps people find your message later.</span>
        <SendButton />
      </div>
    </form>
  )
}
