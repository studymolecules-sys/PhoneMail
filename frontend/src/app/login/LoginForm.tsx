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
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
]

function localMobileNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits.slice(-10)
}

function indianE164(value: string): string {
  return `+91${value.replace(/\D/g, '').slice(-10)}`
}

export default function LoginForm({
  initialPhone = '',
  initialStep = '1',
  errorMessage,
  onSendOtp,
  onVerifyOtp,
}: LoginFormProps) {
  // Shared 4-step onboarding for every screen size:
  // 1: Language selection
  // 2: Terms & Conditions
  // 3: Phone number entry
  // 4: OTP verification
  const [step, setStep] = useState<number>(() => {
    if (initialStep === 'verify') return 4
    if (initialStep === 'phone') return 3
    if (initialPhone) return 3
    return 1
  })

  const [selectedLang, setSelectedLang] = useState('en')
  const [phone, setPhone] = useState(() => localMobileNumber(initialPhone))
  const [otp, setOtp] = useState('')

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('pm_lang')
    // Read client-only preferences after hydration to keep the server and first client render aligned.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLanguage && LANGUAGES.some((item) => item.code === savedLanguage)) setSelectedLang(savedLanguage)
  }, [])

  // GSAP animation on step change
  useGSAP(() => {
    if (!cardRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      cardRef.current,
      { y: 10, scale: 0.99 },
      { y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
    )
  }, [step])


  return (
    <div className={styles.wrapper}>
        <div ref={cardRef} className={styles.mobileScreen}>
          <div className={styles.waBrand}>
            <span className={styles.waBrandMark} aria-hidden="true">P</span>
            <span>PhoneMail</span>
          </div>
          <div className={styles.waProgress} aria-label={`Step ${step} of 4`}>
            <span className={styles.waProgressTrack}><span style={{ width: `${step * 25}%` }} /></span>
            <span className={styles.waProgressLabel}>{step} <span>of 4</span></span>
          </div>
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
                    onClick={() => {
                      setSelectedLang(lang.code)
                      localStorage.setItem('pm_lang', lang.code)
                    }}
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
                <p className={styles.waSubtitle}>Enter your 10-digit mobile number. We&apos;ll text you a verification code.</p>
              </div>

              <div className={styles.phoneBox}>
                <div className={styles.phoneEntry}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    type="tel"
                    name="phone"
                    className={styles.waPhoneInput}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <p className={styles.waSmallHint}>
                Your PhoneMail address will be: <br />
                <strong>{phone ? `91${phone}` : '91XXXXXXXXXX'}@pmail.vixiya.com</strong>
              </p>

              {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

              <div className={styles.waButtonColumn}>
                <button type="submit" className={styles.waPrimaryButton} disabled={phone.length !== 10}>
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
                  <strong>+91 {phone}</strong>.{' '}
                  <button type="button" className={styles.waLink} onClick={() => setStep(3)}>
                    Wrong number?
                  </button>
                </p>
              </div>

              <form action={onVerifyOtp} className={styles.waOtpForm}>
                <input type="hidden" name="phone" value={indianE164(phone)} />

                <div className={styles.otpGrid}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className={styles.waOtpFullInput}
                    name="otp"
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
                  <button type="submit" name="intent" value="resend" formAction={onSendOtp} formNoValidate onClick={() => setOtp('')} className={styles.waGhostButton}>
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
    </div>
  )
}
