import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to PhoneMail! 🎉</h1>
      <p>You have successfully logged in with your phone number: <strong>{user.phone}</strong></p>
      
      <form action="/auth/signout" method="post" style={{ marginTop: '20px' }}>
        <button type="submit" style={{ padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Log Out
        </button>
      </form>
    </div>
  )
}
