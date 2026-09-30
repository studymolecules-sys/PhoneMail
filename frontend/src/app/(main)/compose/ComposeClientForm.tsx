'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './compose.module.css'
import RichTextEditor from '@/components/RichTextEditor'
import { showToast } from '@/components/Toast'
import { sendMessage, type SendMessageState } from '../chat/[contact]/actions'

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
  initialTo?: string
  initialSubject?: string
  initialBody?: string
}

export default function ComposeClientForm({
  initialTo = '',
  initialSubject = '',
  initialBody = ''
}: ComposeClientFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState<SendMessageState, FormData>(sendMessage, { status: 'idle' })
  const handledSuccess = useRef(false)
  const [htmlContent, setHtmlContent] = useState(initialBody)
  const [textContent, setTextContent] = useState(initialBody)

  useEffect(() => {
    if (state.status !== 'success' || handledSuccess.current) return
    handledSuccess.current = true
    showToast(state.notice || state.message, state.notice ? 'info' : 'success')
    router.push(state.destination)
  }, [router, state])

  return (
    <form
      className={styles.form}
      action={formAction}
      onSubmit={() => { handledSuccess.current = false }}
    >
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
      {state.status === 'error' && (
        <p className={styles.formError} role="alert">{state.message}</p>
      )}
    </form>
  )
}
