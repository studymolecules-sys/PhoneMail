'use client'

import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import styles from './login.module.css'
import { Check, ShieldCheck, KeyRound, Globe, ArrowRight } from 'lucide-react'

interface LoginFormProps {
  initialPhone?: string
  initialStep?: string
  errorMessage?: string
  onSendOtp: (formData: FormData) => void
  onVerifyOtp: (formData: FormData) => void
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
}: LoginFormProps) {
  // Mobile 4-step onboarding:
  // 1: Language selection
  // 2: Terms & Conditions
  // 3: Phone number entry
  // 4: OTP verification
  const [step, setStep] = useState<number>(() => {
    if (initialStep === 'verify') return 4
    if (initialPhone) return 3
    return 1
  })

  const [selectedLang, setSelectedLang] = useState('en')
  const [phone, setPhone] = useState(initialStep !== 'verify' && initialPhone.startsWith('+91') ? initialPhone.slice(3) : initialPhone)
  const [otp, setOtp] = useState('')
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
              <h1 className={styles.brandTitle}>PhoneMail</h1>
              <p className={styles.brandSubtitle}>Your phone number is your address</p>
            </div>
          </div>

          <form action={step === 4 ? onVerifyOtp : onSendOtp} className={styles.desktopForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="desktop-phone" className={styles.inputLabel}>
                Phone Number
              </label>
              <div className={styles.phoneInputWrapper}>
                <span className={styles.countryCode}>International</span>
                <input
                  id="desktop-phone"
                  name="phone"
                  type="tel"
                  className={styles.desktopInput}
                  placeholder="Include country code, e.g. +1 555 010 0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <span className={styles.hintText}>
                Your PhoneMail ID will be: <strong>{phone ? phone.replace(/[^0-9]/g, '') : 'number'}@pmail.vixiya.com</strong>
              </span>
            </div>

            {step === 4 && <div className={styles.inputGroup}>
              <input type="hidden" name="phone" value={phone} />
              <label htmlFor="desktop-otp" className={styles.inputLabel}>
                Verification Code
              </label>
              <div className={styles.otpInputWrapper}>
                <input
                  id="desktop-otp"
                  name="otp"
                  type="tel"
                  className={styles.desktopInput}
                  placeholder="6-digit code sent via SMS"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
            </div>}

            {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

            {/* Mandated by Task.docx: Hyperlink to Terms of Service directly above Next button */}
            <p className={styles.termsAgreement}>
              By signing up, you agree to the{' '}
              <a href="#terms-modal" className={styles.legalLink}>
                Terms of Service
              </a>
            </p>

            <button type="submit" className={styles.desktopNextButton}>
              <span>{step === 4 ? 'Verify and sign in' : 'Send code'}</span>
              <ArrowRight size={18} />
            </button>
            {step === 4 && <button type="submit" formAction={onSendOtp} formNoValidate onClick={() => setOtp('')} className={styles.waGhostButton}>Send a new code</button>}
          </form>

          <div className={styles.desktopFooter}>
            <span className={styles.switchModeText}>New number? You&apos;ll be registered automatically.</span>
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
                  Your phone number is your email address. Read our{' '}
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
            <form action={onSendOtp} className={styles.waStepContainer}>
              <div className={styles.waStepHeader}>
                <h2 className={styles.waTitle}>Enter your phone number</h2>
                <p className={styles.waSubtitle}>Enter your number with its country code. We&apos;ll text you a verification code.</p>
              </div>

              <div className={styles.phoneBox}>
                <div className={styles.countrySelector}>
                  <span>International number</span>
                  <span className={styles.countryCodeText}>Include +country code</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  className={styles.waPhoneInput}
                  placeholder="Phone number with country code"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  autoFocus
                  required
                />
              </div>

              <p className={styles.waSmallHint}>
                Your PhoneMail address will be: <br />
                <strong>{phone.replace(/[^0-9]/g, '') || 'yournumber'}@pmail.vixiya.com</strong>
              </p>

              {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

              <div className={styles.waButtonColumn}>
                <button type="submit" className={styles.waPrimaryButton} disabled={!phone.trim()}>
                  Send code
                </button>
                <button type="button" className={styles.waGhostButton} onClick={() => setStep(2)}>
                  Back
                </button>
              </div>
            </form>
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
                  Enter the code sent to{' '}
                  <strong>{phone}</strong>.{' '}
                  <span className={styles.waLink} onClick={() => setStep(3)}>
                    Wrong number?
                  </span>
                </p>
              </div>

              <form action={onVerifyOtp} className={styles.waOtpForm}>
                <input type="hidden" name="phone" value={phone} />
                <input type="hidden" name="otp" value={otp} />

                <div className={styles.otpGrid}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className={styles.waOtpFullInput}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    required
                    pattern="[0-9]{6}"
                  />
                </div>

                <p className={styles.waSmallHint}>
                  We sent a code to <strong>{phone}</strong>.
                </p>

                {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

                <div className={styles.waButtonColumn}>
                  <button type="submit" className={styles.waPrimaryButton}>
                    Continue
                  </button>
                  <button type="submit" formAction={onSendOtp} formNoValidate onClick={() => setOtp('')} className={styles.waGhostButton}>
                    Resend code
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
