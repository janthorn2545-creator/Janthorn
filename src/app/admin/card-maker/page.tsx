import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CardMakerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'superadmin'].includes(profile?.role || '')) redirect('/employee/dashboard')

  return (
    <div className="w-full h-full">
      <iframe
        src="/card-maker.html"
        className="w-full border-0"
        style={{ height: 'calc(100vh - 0px)' }}
        title="ID Card Maker"
      />
    </div>
  )
}
