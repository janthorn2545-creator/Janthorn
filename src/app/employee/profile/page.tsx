export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

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
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{profile?.full_name}</div>
            <div className="text-sm text-gray-500">{profile?.department || 'ไม่ระบุแผนก'}</div>
            <div className="text-xs text-gray-400 mt-0.5">{profile?.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-semibold text-blue-700">{enrollCount || 0}</div>
            <div className="text-xs text-blue-600 mt-0.5">คอร์สที่เรียน</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-semibold text-green-700">{certCount || 0}</div>
            <div className="text-xs text-green-600 mt-0.5">ใบรับรอง</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { label: 'ชื่อ-นามสกุล', value: profile?.full_name },
            { label: 'อีเมล', value: profile?.email },
            { label: 'แผนก', value: profile?.department || '—' },
            { label: 'ตำแหน่ง', value: profile?.position || '—' },
            { label: 'สมัครเมื่อ', value: profile?.created_at ? formatDate(profile.created_at) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
