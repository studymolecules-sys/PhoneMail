import ClientShell from '@/components/ClientShell'
import Sidebar from '@/components/Sidebar'
import InboxPane from '@/components/InboxPane'
import GmailDesktopClient from '@/components/GmailDesktopClient'
import Toast from '@/components/Toast'
import { createClient } from '@/lib/supabase/server'
import splitStyles from '@/components/ResponsiveSplit.module.css'
import { getDemoEmails } from '@/lib/demo-emails'

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
  const userEmailId = cleanDigits ? `${cleanDigits}@pmail.vixiya.com` : 'user@pmail.vixiya.com'

  // Fetch emails for Desktop view
  const demoMode = process.env.PHONEMAIL_DEMO_MODE === 'true'
  const { data: emails } = demoMode ? { data: null } : await supabase
    .from('emails')
    .select('*')
    .or(`sender_address.eq.${userEmailId},recipient_address.eq.${userEmailId}`)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className={splitStyles.desktopOnly}>
        <GmailDesktopClient 
          rawEmails={demoMode ? getDemoEmails(userEmailId) : emails || []}
          userEmailId={userEmailId} 
          userPhone={rawPhone} 
        />
      </div>
      
      <div className={splitStyles.mobileOnly}>
        <ClientShell
          sidebar={<Sidebar userEmailId={userEmailId} userPhone={rawPhone} />}
          inbox={<InboxPane />}
        >
          {children}
        </ClientShell>
      </div>

      <Toast />
    </>
  )
}
