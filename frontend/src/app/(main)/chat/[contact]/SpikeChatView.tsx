'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import styles from './chat.module.css'
import {
  ArrowLeft,
  Send,
  MailPlus,
  Check,
  CheckCheck,
  Reply,
  X,
  Maximize2,
  ExternalLink,
  Lock,
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

export interface EmailMessage {
  id: string
  sender_address: string
  recipient_address: string
  subject: string
  body_text: string
  body_html: string
  created_at: string
  read_status: boolean
}

interface SpikeChatViewProps {
  contact: string
  currentUser: string
  initialMessages: EmailMessage[]
  onSendMessage: (formData: FormData) => Promise<void>
}

export default function SpikeChatView({
  contact,
  currentUser,
  initialMessages,
  onSendMessage,
}: SpikeChatViewProps) {
  const [messages, setMessages] = useState<EmailMessage[]>(initialMessages)
  const [replyingTo, setReplyingTo] = useState<EmailMessage | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [isTraditionalComposeOpen, setIsTraditionalComposeOpen] = useState(false)
  const [subjectText, setSubjectText] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [messageHtml, setMessageHtml] = useState('')
  const [isSending, setIsSending] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on load
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // GSAP animation for chat bubbles
  useGSAP(() => {
    if (!containerRef.current) return
    const bubbles = containerRef.current.querySelectorAll('.chat-bubble-item')
    if (bubbles.length === 0) return

    gsap.fromTo(
      bubbles,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out' }
    )
  }, [messages.length])

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleTagReply = (msg: EmailMessage) => {
    setReplyingTo(msg)
    inputRef.current?.focus()
  }

  const handleClearReply = () => {
    setReplyingTo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim() || isSending) return

    setIsSending(true)

    // Optimistic message creation
    const finalSubject = replyingTo
      ? `Re: ${replyingTo.subject || 'Message'}`
      : subjectText.trim()

    let fullBody = messageBody.trim()
    if (replyingTo) {
      const quotedSender = replyingTo.sender_address.replace('@pmail.vixiya.com', '')
      fullBody = `> On ${new Date(replyingTo.created_at).toLocaleDateString()} ${quotedSender} wrote:\n> "${replyingTo.body_text?.slice(0, 100)}"\n\n${fullBody}`
    }

    const optimisticMsg: EmailMessage = {
      id: `temp-${Date.now()}`,
      sender_address: currentUser,
      recipient_address: contact,
      subject: finalSubject,
      body_text: fullBody,
      body_html: messageHtml || `<p>${fullBody.replace(/\n/g, '<br/>')}</p>`,
      created_at: new Date().toISOString(),
      read_status: false,
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setMessageBody('')
    setMessageHtml('')
    setSubjectText('')
    setReplyingTo(null)
    if (inputRef.current) inputRef.current.style.height = '42px'

    const formData = new FormData()
    formData.append('from', currentUser)
    formData.append('to', contact)
    formData.append('subject', finalSubject)
    formData.append('body', fullBody)
    formData.append('body_html', messageHtml)

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 50, 20]) // Success pattern
      }
      await onSendMessage(formData)
    } catch (err) {
      console.error('Failed to dispatch message:', err)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 100, 50]) // Error pattern
      }
    } finally {
      setIsSending(false)
    }
  }

  const displayName = contact.replace('@pmail.vixiya.com', '')
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className={styles.chatContainer}>
      {/* WhatsApp Chat Top Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backButton} aria-label="Back to Inbox">
            <ArrowLeft size={22} />
          </Link>
          <div className={styles.headerAvatar}>
            <span>{initials}</span>
          </div>
          <div className={styles.headerTitle}>
            <h2>{displayName}</h2>
            <span className={styles.headerSubtitle}>{contact}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.headerActionBtn}
            onClick={() => setIsTraditionalComposeOpen(true)}
            aria-label="Expand to full email view"
          >
            <Maximize2 size={19} />
          </button>
        </div>
      </header>

      {/* WhatsApp Doodle Chat Canvas */}
      <main className={styles.messageArea}>

        <div ref={containerRef} className={styles.threadContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyChat}>
              <p>No messages yet with {displayName}.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_address === currentUser
              const isLongEmail = (msg.body_text || '').length > 180

              return (
                <div
                  key={msg.id}
                  className={`chat-bubble-item ${styles.messageWrapper} ${isMe ? styles.sent : styles.received}`}
                >
                  <div
                    className={styles.bubble}
                    onClick={() => setSelectedEmail(msg)}
                    aria-label="Tap to open in Traditional View"
                  >
                    {/* Spike Compact Subject */}
                    {msg.subject && msg.subject.trim() !== '' && (
                      <div className={styles.msgSubjectBadge}>
                        <span>{msg.subject}</span>
                      </div>
                    )}

                    {/* Email Message Content */}
                    <div className={styles.msgBody}>
                      {msg.body_text}
                    </div>

                    {/* Long Email Indicator */}
                    {isLongEmail && (
                      <div className={styles.readMoreTag}>
                        <ExternalLink size={12} />
                        <span>Tap to read full email</span>
                      </div>
                    )}

                    {/* Footer: Time + Ticks + View Full Email */}
                    <div className={styles.bubbleFooter}>
                      <span className={styles.msgTime}>{formatTime(msg.created_at)}</span>
                      {isMe && (msg.read_status
                        ? <CheckCheck size={15} className={styles.tickIcon} aria-label="Read" />
                        : <Check size={15} className={styles.tickIcon} aria-label="Sent" />)}
                      {msg.body_html && msg.body_html !== `<p>${msg.body_text}</p>` && (
                        <button
                          type="button"
                          className={styles.viewFullBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEmail(msg)
                          }}
                          aria-label="View original HTML email"
                          title="View Full Email"
                        >
                          <ExternalLink size={12} style={{ marginRight: '4px' }} /> View
                        </button>
                      )}
                    </div>

                    {/* Quick Swipe/Tag Reply Button (Mandated by Task.docx) */}
                    <button
                      type="button"
                      className={styles.bubbleReplyBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTagReply(msg)
                      }}
                      aria-label="Swipe / Tag to reply"
                    >
                      <Reply size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Replying-to Preview Banner (Mandated in Task.docx) */}
      {replyingTo && (
        <div className={styles.replyBanner}>
          <div className={styles.replyBannerLeft}>
            <Reply size={16} className={styles.replyBannerIcon} />
            <div className={styles.replyBannerText}>
              <span className={styles.replySender}>
                Replying to {replyingTo.sender_address.replace('@pmail.vixiya.com', '')}
              </span>
              <p className={styles.replySnippet}>
                {replyingTo.body_text?.slice(0, 70)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.replyCloseBtn}
            onClick={handleClearReply}
            aria-label="Cancel reply tag"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* A short reply field with an optional full email editor. */}
      <form className={styles.inputArea} onSubmit={handleSubmit}>
        {/* Compact Subject Field: Hidden when replying to a message (Mandated by Task.docx) */}
        {!replyingTo && (
          <div className={styles.subjectRow}>
            <input
              type="text"
              name="subject"
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
              className={styles.compactSubjectInput}
              placeholder="Subject (Optional)"
              autoComplete="off"
            />
          </div>
        )}

        <div className={styles.messageRow}>
          <button
            type="button"
            className={styles.cameraSlotBtn}
            onClick={() => setIsTraditionalComposeOpen(true)}
            title="Open the full email editor"
            aria-label="Open the full email editor"
          >
            <MailPlus size={19} />
          </button>

          <textarea
            ref={inputRef}
            name="body"
            rows={1}
            value={messageBody}
            onChange={(e) => {
              setMessageBody(e.target.value)
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`
            }}
            className={styles.messageInput}
            placeholder={replyingTo ? 'Write a reply…' : 'Write a message…'}
            required
            autoComplete="off"
          />

          <button
            type="submit"
            className={styles.sendButton}
            disabled={!messageBody.trim() || isSending}
            aria-label="Send Email"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* TRADITIONAL VIEW MODAL: Tap long email to expand (Mandated in Task.docx) */}
      {selectedEmail && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEmail(null)}>
          <div className={styles.traditionalModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.traditionalHeader}>
              <div>
                <span className={styles.traditionalCategory}>Full Message</span>
                <h3 className={styles.traditionalSubject}>
                  {selectedEmail.subject || '(No Subject)'}
                </h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedEmail(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.traditionalMeta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>From:</span>
                <span className={styles.metaVal}>{selectedEmail.sender_address}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>To:</span>
                <span className={styles.metaVal}>{selectedEmail.recipient_address}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Date:</span>
                <span className={styles.metaVal}>
                  {new Date(selectedEmail.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.traditionalBody}>
              {selectedEmail.body_html ? (
                <iframe className={styles.emailHtmlFrame} title="Email content" sandbox="" srcDoc={selectedEmail.body_html} />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedEmail.body_text}</p>
              )}
            </div>

            <div className={styles.traditionalFooter}>
              <button
                type="button"
                className={styles.traditionalReplyBtn}
                onClick={() => {
                  const toReply = selectedEmail
                  setSelectedEmail(null)
                  handleTagReply(toReply)
                }}
              >
                <Reply size={16} /> Reply to this email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRADITIONAL COMPOSE MODAL (Mandated in Task.docx): To field locked to contact */}
      {isTraditionalComposeOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTraditionalComposeOpen(false)}>
          <div className={styles.traditionalModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.traditionalHeader}>
              <div>
                <span className={styles.traditionalCategory}>New Message</span>
                <h3 className={styles.traditionalSubject}>New Message</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsTraditionalComposeOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const formData = new FormData(form)
                setIsTraditionalComposeOpen(false)
                await onSendMessage(formData)
              }}
              className={styles.traditionalComposeForm}
            >
              <input type="hidden" name="from" value={currentUser} />

              {/* To field is LOCKED per Task.docx requirement */}
              <div className={styles.lockedFieldRow}>
                <label className={styles.lockedLabel}>To:</label>
                <input
                  type="text"
                  name="to"
                  value={contact}
                  readOnly
                  className={styles.lockedInput}
                />
                <Lock size={14} className={styles.lockedIcon} />
              </div>

              <div className={styles.formInputGroup}>
                <label className={styles.fieldLabel}>Subject:</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter subject..."
                  className={styles.modalSubjectInput}
                />
              </div>

              <div className={styles.formInputGroup} style={{ flex: 1, overflow: 'hidden' }}>
                <RichTextEditor
                  value={messageBody}
                  onChange={(html, text) => {
                    setMessageHtml(html)
                    setMessageBody(text)
                  }}
                  placeholder="Write your message..."
                />
                <input type="hidden" name="body" value={messageBody} />
                <input type="hidden" name="body_html" value={messageHtml} />
              </div>

              <div className={styles.traditionalFooter}>
                <button type="submit" className={styles.modalSendBtn}>
                  <Send size={16} /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
