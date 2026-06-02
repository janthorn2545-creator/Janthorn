export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import AddUserButton from './AddUserButton'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  const { data: certCounts } = await supabase
    .from('certificates')
    .select('user_id')

  const certMap: Record<string, number> = {}
  ;(certCounts || []).forEach((c: any) => {
    certMap[c.user_id] = (certMap[c.user_id] || 0) + 1
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ข้อมูลพนักงาน</h1>
          <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด {users?.length || 0} คน</p>
        </div>
        <AddUserButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['พนักงาน', 'แผนก / ตำแหน่ง', 'อีเมล', 'บัตรที่ได้', 'วันที่สมัคร'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users || []).map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                      {u.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-gray-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  <div>{u.department || '—'}</div>
                  <div className="text-gray-400">{u.position || ''}</div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  {certMap[u.id] ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {certMap[u.id]} บัตร
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">ยังไม่มี</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm">ยังไม่มีพนักงาน กดปุ่ม "เพิ่มพนักงาน" เพื่อเริ่ม</p>
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 พนักงานเข้าระบบได้ 2 วิธี</p>
        <p className="text-xs text-blue-700">1. Admin เพิ่มให้ → พนักงานรับอีเมลแล้ว login ด้วยรหัสที่ตั้งไว้</p>
        <p className="text-xs text-blue-700 mt-0.5">2. พนักงานสมัครเองที่ <Link href="/auth/register" className="underline font-medium">/auth/register</Link></p>
      </div>
    </div>
  )
}
