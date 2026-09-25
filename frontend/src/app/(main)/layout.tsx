import ClientShell from '@/components/ClientShell'
import Sidebar from '@/components/Sidebar'
import InboxPane from '@/components/InboxPane'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientShell sidebar={<Sidebar />} inbox={<InboxPane />}>
      {children}
    </ClientShell>
  )
}
