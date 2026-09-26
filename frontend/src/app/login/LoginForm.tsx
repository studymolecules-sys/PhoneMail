'use client'

import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import styles from './login.module.css'
import { Check, ShieldCheck, Smartphone, KeyRound, Globe, ArrowRight, Sparkles } from 'lucide-react'

interface LoginFormProps {
  initialPhone?: string
  initialStep?: string
  errorMessage?: string
  onSendOtp: (formData: FormData) => void
  onVerifyOtp: (formData: FormData) => void
  onDirectLogin: (formData: FormData) => void
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
]

export default function LoginForm({
  initialPhone = '',
  initialStep = '1',
  errorMessage,
  onSendOtp,
  onVerifyOtp,
  onDirectLogin
}: LoginFormProps) {
  // Mobile 4-step onboarding:
  // 1: Language selection
  // 2: Terms & Conditions
  // 3: Phone number verification (with auto-detect simulation)
  // 4: OTP verification (with auto-fill simulation)
  const [step, setStep] = useState<number>(() => {
    if (initialStep === 'verify') return 4
    if (initialPhone) return 3
    return 1
  })

  const [selectedLang, setSelectedLang] = useState('en')
  const [phone, setPhone] = useState(initialPhone || '+1 (555) 019-2834')
  const [otp, setOtp] = useState('')
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDesktopMode, setIsDesktopMode] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // Detect screen size on client to toggle between mobile WhatsApp wizard and desktop Gmail card
  useEffect(() => {
    const checkWidth = () => {
      setIsDesktopMode(window.innerWidth >= 860)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // GSAP animation on step change
  useGSAP(() => {
    if (!cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
    )
  }, [step, isDesktopMode])

  // Simulated SIM auto-detection on mobile Step 3
  const handleAutoDetectPhone = () => {
    setIsAutoDetecting(true)
    setTimeout(() => {
      setPhone('+1 (555) 019-2834')
      setIsAutoDetecting(false)
    }, 600)
  }

  // Simulated OTP auto-fill on mobile Step 4
  const handleAutoFillOtp = () => {
    setIsVerifying(true)
    let current = ''
    const target = '849201'
    let idx = 0
    const interval = setInterval(() => {
      if (idx < target.length) {
        current += target[idx]
        setOtp(current)
        idx++
      } else {
        clearInterval(interval)
        setIsVerifying(false)
      }
    }, 100)
  }

  return (
    <div className={styles.wrapper}>
      {/* DESKTOP WEB CLIENT LOGIN: Single Screen (As specified in Task.docx) */}
      {isDesktopMode ? (
        <div ref={cardRef} className={styles.desktopCard}>
          <div className={styles.brandRow}>
            <div className={styles.logoBadge}>
              <span className={styles.logoLetter}>P</span>
            </div>
            <div>
              <h1 className={styles.brandTitle}>PhoneMail Web</h1>
              <p className={styles.brandSubtitle}>Sign in to your email inbox</p>
            </div>
          </div>

          <form action={onDirectLogin} className={styles.desktopForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="desktop-phone" className={styles.inputLabel}>
                Phone Number
              </label>
              <div className={styles.phoneInputWrapper}>
                <span className={styles.countryCode}>US +1</span>
                <input
                  id="desktop-phone"
                  name="phone"
                  type="tel"
                  className={styles.desktopInput}
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <span className={styles.hintText}>
                Your PhoneMail ID will be: <strong>{phone ? phone.replace(/[^0-9]/g, '') : 'number'}@pmail.vixiya.com</strong>
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="desktop-otp" className={styles.inputLabel}>
                Security Code / OTP
              </label>
              <div className={styles.otpInputWrapper}>
                <input
                  id="desktop-otp"
                  name="otp"
                  type="text"
                  className={styles.desktopInput}
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <button
                  type="button"
                  className={styles.simulateButton}
                  onClick={() => setOtp('123456')}
                  title="Auto-fill demo code"
                >
                  <Sparkles size={14} /> Auto-fill
                </button>
              </div>
            </div>

            {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

            {/* Mandated by Task.docx: Hyperlink to Terms of Service directly above Next button */}
            <p className={styles.termsAgreement}>
              By signing up, you agree to the{' '}
              <a href="#terms-modal" className={styles.legalLink}>
                Terms of Service
              </a>
            </p>

            <button type="submit" className={styles.desktopNextButton}>
              <span>Next</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className={styles.desktopFooter}>
            <span className={styles.switchModeText}>Toll-Free IVR Registration active on Port 25</span>
          </div>
        </div>
      ) : (
        /* MOBILE CLIENT: 4-Step WhatsApp Design Language Onboarding */
        <div ref={cardRef} className={styles.mobileScreen}>
          {/* STEP 1: Language Selection */}
          {step === 1 && (
            <div className={styles.waStepContainer}>
              <div className={styles.waStepHeader}>
                <div className={styles.waIconPill}>
                  <Globe size={24} className={styles.waAccentIcon} />
                </div>
                <h2 className={styles.waTitle}>Choose your language</h2>
                <p className={styles.waSubtitle}>Select the language you want to use PhoneMail in</p>
              </div>

              <div className={styles.langList}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`${styles.langItem} ${selectedLang === lang.code ? styles.langItemSelected : ''}`}
                    onClick={() => setSelectedLang(lang.code)}
                  >
                    <div className={styles.langItemText}>
                      <span className={styles.langNative}>{lang.native}</span>
                      <span className={styles.langEnglish}>{lang.label}</span>
                    </div>
                    {selectedLang === lang.code && (
                      <div className={styles.checkCircle}>
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.waPrimaryButton}
                onClick={() => setStep(2)}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Terms & Conditions */}
          {step === 2 && (
            <div className={styles.waStepContainer}>
              <div className={styles.waSplashArt}>
                <div className={styles.waSplashCircle}>
                  <ShieldCheck size={56} className={styles.waSplashIcon} />
                </div>
              </div>

              <div className={styles.waTermsContent}>
                <h2 className={styles.waTitle}>Welcome to PhoneMail</h2>
                <p className={styles.waTermsText}>
                  PhoneMail bridges the gap between instant messaging and email. Read our{' '}
                  <span className={styles.waLink}>Privacy Policy</span>. Tap &ldquo;Agree and continue&rdquo; to accept the{' '}
                  <span className={styles.waLink}>Terms of Service</span>.
                </p>
              </div>

              <div className={styles.waButtonColumn}>
                <button
                  type="button"
                  className={styles.waPrimaryButton}
                  onClick={() => setStep(3)}
                >
                  Agree and continue
                </button>
                <button
                  type="button"
                  className={styles.waGhostButton}
                  onClick={() => setStep(1)}
                >
                  Change Language
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Phone Number Verification */}
          {step === 3 && (
            <div className={styles.waStepContainer}>
              <div className={styles.waStepHeader}>
                <h2 className={styles.waTitle}>Enter your phone number</h2>
                <p className={styles.waSubtitle}>
                  PhoneMail will verify your account. Carrier SMS charges may apply.
                </p>
              </div>

              <div className={styles.simDetectBanner}>
                <div className={styles.simInfo}>
                  <Smartphone size={18} />
                  <span>SIM 1 Detected</span>
                </div>
                <button
                  type="button"
                  className={styles.simDetectBtn}
                  onClick={handleAutoDetectPhone}
                  disabled={isAutoDetecting}
                >
                  {isAutoDetecting ? 'Detecting...' : 'Auto-fill SIM'}
                </button>
              </div>

              <div className={styles.phoneBox}>
                <div className={styles.countrySelector}>
                  <span>United States</span>
                  <span className={styles.countryCodeText}>+1</span>
                </div>
                <input
                  type="tel"
                  className={styles.waPhoneInput}
                  placeholder="phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>

              <p className={styles.waSmallHint}>
                Your email identity will automatically be: <br />
                <strong>{phone.replace(/[^0-9]/g, '') || 'yournumber'}@pmail.vixiya.com</strong>
              </p>

              <div className={styles.waButtonColumn}>
                <button
                  type="button"
                  className={styles.waPrimaryButton}
                  onClick={() => setStep(4)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className={styles.waGhostButton}
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: OTP Verification */}
          {step === 4 && (
            <div className={styles.waStepContainer}>
              <div className={styles.waStepHeader}>
                <div className={styles.waIconPill}>
                  <KeyRound size={24} className={styles.waAccentIcon} />
                </div>
                <h2 className={styles.waTitle}>Verifying your number</h2>
                <p className={styles.waSubtitle}>
                  Waiting to automatically detect an SMS sent to{' '}
                  <strong>{phone}</strong>.{' '}
                  <span className={styles.waLink} onClick={() => setStep(3)}>
                    Wrong number?
                  </span>
                </p>
              </div>

              <form action={onDirectLogin} className={styles.waOtpForm}>
                <input type="hidden" name="phone" value={phone} />
                <input type="hidden" name="otp" value={otp || '123456'} />

                <div className={styles.otpGrid}>
                  <input
                    type="text"
                    maxLength={6}
                    className={styles.waOtpFullInput}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className={styles.simDetectBanner}>
                  <Sparkles size={16} />
                  <span>SMS Auto-detector listening...</span>
                  <button
                    type="button"
                    className={styles.simDetectBtn}
                    onClick={handleAutoFillOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Reading SMS...' : 'Simulate Auto-Detection'}
                  </button>
                </div>

                {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

                <div className={styles.waButtonColumn}>
                  <button type="submit" className={styles.waPrimaryButton}>
                    Verify & Enter PhoneMail
                  </button>
                  <button
                    type="button"
                    className={styles.waGhostButton}
                    onClick={() => setStep(3)}
                  >
                    Edit Phone Number
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
