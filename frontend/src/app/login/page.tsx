import LoginForm from './LoginForm'
import { sendOtp, verifyOtp } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; step?: string; phone?: string }>
}) {
  const params = await searchParams

  return (
    <LoginForm
      key={`${params?.step || 'start'}:${params?.phone || ''}`}
      initialPhone={params?.phone}
      initialStep={params?.step}
      errorMessage={params?.message}
      onSendOtp={sendOtp}
      onVerifyOtp={verifyOtp}
    />
  )
}
