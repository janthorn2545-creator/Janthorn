import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', user.id).single()

  if (!['superadmin', 'admin'].includes(profile?.role || '')) {
    redirect('/employee/dashboard')
  }

  const { count: pendingCount } = await supabase
    .from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={profile.role} user={profile} pendingCount={pendingCount || 0} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
