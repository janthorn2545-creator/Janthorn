export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { count: certCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: enrollCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved')

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">โปรไฟล์</h1>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-semibold text-blue-700">{enrollCount || 0}</div>
          <div className="text-xs text-blue-600 mt-0.5">คอร์สที่เรียน</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-semibold text-green-700">{certCount || 0}</div>
          <div className="text-xs text-green-600 mt-0.5">บัตรผู้รับเหมา</div>
        </div>
      </div>
      <ProfileForm profile={profile} userId={user.id} />
    </div>
  )
}
