import ClientShell from '@/components/ClientShell'
import Sidebar from '@/components/Sidebar'
import InboxPane from '@/components/InboxPane'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rawPhone = user?.phone || user?.user_metadata?.phone || user?.email?.split('@')[0] || ''
  const cleanDigits = rawPhone.replace(/[^\d]/g, '')
  const userEmailId = cleanDigits ? `${cleanDigits}@phonemail.com` : 'user@phonemail.com'

  return (
    <ClientShell
      sidebar={<Sidebar userEmailId={userEmailId} userPhone={rawPhone} />}
      inbox={<InboxPane />}
    >
      {children}
    </ClientShell>
  )
}
