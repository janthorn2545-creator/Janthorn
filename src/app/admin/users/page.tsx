export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ข้อมูลพนักงาน</h1>
        <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด {users?.length || 0} คน</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['พนักงาน', 'แผนก', 'อีเมล', 'วันที่สมัคร'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users || []).map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                      {u.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-gray-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.department || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="text-center py-10 text-sm text-gray-400">ยังไม่มีพนักงาน</p>
        )}
      </div>
    </div>
  )
}
