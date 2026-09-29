import { Lock } from 'lucide-react'

export default function HomePlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'var(--wa-app-bg)',
        color: 'var(--wa-text-secondary)',
        flexDirection: 'column',
        padding: '32px',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
        borderLeft: '1px solid var(--wa-border)'
      }}
    >
      <div
        style={{
          width: '320px',
          height: '180px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'none\'%3E%3Cpath d=\'M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z\' fill=\'%23202c33\'/%3E%3Cpath d=\'M30 50 L45 65 L70 35\' stroke=\'%2300a884\' stroke-width=\'4\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          marginBottom: '32px',
          opacity: 0.8
        }}
      />

      <h2
        style={{
          fontSize: '32px',
          fontWeight: 300,
          color: 'var(--wa-text-primary)',
          margin: '0 0 16px',
        }}
      >
        PhoneMail
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--wa-text-secondary)',
          lineHeight: '1.5',
          margin: '0 0 32px',
        }}
      >
        Send and receive messages seamlessly. <br/>
        Use your phone number as your universal address.
      </p>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--wa-text-muted)' }}>
        <Lock size={10} />
        <span>Private to your account</span>
      </div>
    </div>
  )
}
