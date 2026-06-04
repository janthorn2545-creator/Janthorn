export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (['superadmin', 'admin'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }
  redirect('/employee/dashboard')
}
