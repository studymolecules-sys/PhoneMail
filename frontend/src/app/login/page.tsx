import styles from './login.module.css'
import { login, signup } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>PhoneMail</h1>
        <p className={styles.subtitle}>Log in or Sign up with your phone number</p>
        
        <form className={styles.form}>
          <label className={styles.label} htmlFor="phone">Phone Number</label>
          <input
            className={styles.input}
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            required
          />

          <label className={styles.label} htmlFor="password">Password (or OTP)</label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />

          <div className={styles.buttonGroup}>
            <button formAction={login} className={styles.buttonPrimary}>
              Log In
            </button>
            <button formAction={signup} className={styles.buttonSecondary}>
              Sign Up
            </button>
          </div>

          {searchParams?.message && (
            <p className={styles.error}>{searchParams.message}</p>
          )}
        </form>
        <p className={styles.terms}>
          By signing up, you agree to our <a href="#">Terms of Service</a>.
        </p>
      </div>
    </div>
  )
}
