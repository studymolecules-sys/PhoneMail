import styles from './login.module.css'
import { sendOtp, verifyOtp } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; step?: string; phone?: string }>
}) {
  const params = await searchParams
  const isVerifyStep = params?.step === 'verify'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>PhoneMail</h1>
        <p className={styles.subtitle}>
          {isVerifyStep
            ? `Enter the 6-digit code sent to ${params.phone}`
            : 'Log in or Sign up with your phone number'}
        </p>

        <form className={styles.form}>
          {!isVerifyStep ? (
            <>
              <label className={styles.label} htmlFor="phone">
                Phone Number (Include Country Code)
              </label>
              <input
                className={styles.input}
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 919876543210"
                defaultValue={params?.phone || ''}
                required
              />
              <div className={styles.buttonGroup}>
                <button formAction={sendOtp} className={styles.buttonPrimary}>
                  Send Code
                </button>
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="phone" value={params.phone || ''} />
              <label className={styles.label} htmlFor="otp">
                Verification Code
              </label>
              <input
                className={styles.input}
                id="otp"
                name="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                required
              />
              <div className={styles.buttonGroup}>
                <button formAction={verifyOtp} className={styles.buttonPrimary}>
                  Verify & Log In
                </button>
                <a href="/login" className={styles.buttonSecondary} style={{ textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  Back
                </a>
              </div>
            </>
          )}

          {params?.message && <p className={styles.error}>{params.message}</p>}
        </form>
        <p className={styles.terms}>
          By signing in, you agree to our <a href="#">Terms of Service</a>.
        </p>
      </div>
    </div>
  )
}
