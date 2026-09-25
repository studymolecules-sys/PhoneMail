import Link from 'next/link'
import { Mail, PenSquare, Shield, Sparkles, Terminal, Keyboard } from 'lucide-react'

export default function HomePlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'var(--gm-app-bg)',
        color: 'var(--gm-text-secondary)',
        flexDirection: 'column',
        padding: '32px',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          backgroundColor: '#e8f0fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(11, 87, 208, 0.1)',
        }}
      >
        <Mail size={36} color="#0b57d0" />
      </div>

      <h2
        style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--gm-text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        PhoneMail Universal Inbox
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--gm-text-muted)',
          maxWidth: '380px',
          lineHeight: '1.5',
          margin: '0 0 24px',
        }}
      >
        Select a conversation from the left to read email messages in high-speed instant format, or compose a new email.
      </p>

      {/* Quick Action Button */}
      <Link
        href="/compose"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0b57d0',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '9999px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '32px',
          boxShadow: '0 2px 6px rgba(11, 87, 208, 0.25)',
        }}
      >
        <PenSquare size={16} /> Compose New Email
      </Link>

      {/* Feature & Architecture Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          maxWidth: '560px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e3e7',
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0b57d0', marginBottom: '6px' }}>
            <Terminal size={16} />
            <strong style={{ fontSize: '13px' }}>Instant Delivery</strong>
          </div>
          <span style={{ fontSize: '12px', color: '#5e5e5e', lineHeight: '1.4' }}>
            Messages are delivered instantly via our optimized routing.
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e3e7',
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00875a', marginBottom: '6px' }}>
            <Shield size={16} />
            <strong style={{ fontSize: '13px' }}>Row Level Security</strong>
          </div>
          <span style={{ fontSize: '12px', color: '#5e5e5e', lineHeight: '1.4' }}>
            Strict auth.jwt() policies isolate user phone mailboxes in PostgreSQL.
          </span>
        </div>
      </div>
    </div>
  )
}
