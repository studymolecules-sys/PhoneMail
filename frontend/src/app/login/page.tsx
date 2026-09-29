import LoginForm from './LoginForm'
import { sendOtp, verifyOtp } from './actions'
import { cookies } from 'next/headers'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; step?: string }>
}) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()])
  const pendingPhone = cookieStore.get('pm_pending_phone')?.value || ''

  return (
    <LoginForm
      key={`${params?.step || 'start'}:${pendingPhone}`}
      initialPhone={pendingPhone}
      initialStep={params?.step}
      errorMessage={params?.message}
      onSendOtp={sendOtp}
      onVerifyOtp={verifyOtp}
    />
  )
}
