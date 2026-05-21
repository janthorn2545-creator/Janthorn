export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import ApprovalActions from './ApprovalActions'

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('enrollments')
    .select('*, users(full_name, email, department), courses(title)')
    .eq('status', 'pending')
    .order('enrolled_at', { ascending: false })

  const { data: history } = await supabase
    .from('enrollments')
    .select('*, users(full_name), courses(title)')
    .neq('status', 'pending')
    .order('approved_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">อนุมัติการเข้าถึง</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pending?.length ? `มี ${pending.length} คำขอรออนุมัติ` : 'ไม่มีคำขอที่รอดำเนินการ'}
        </p>
      </div>

      {/* Pending */}
      {pending && pending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-amber-50 flex items-center gap-2">
            <span className="text-sm font-medium text-amber-800">⏳ รออนุมัติ</span>
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((e: any) => (
              <div key={e.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                  {e.users?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{e.users?.full_name}</div>
                  <div className="text-xs text-gray-500">{e.users?.email} · {e.users?.department}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    ขอสิทธิ์: <span className="font-medium">{e.courses?.title}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(e.enrolled_at)}</div>
                </div>
                <ApprovalActions enrollmentId={e.id} userName={e.users?.full_name} userEmail={e.users?.email} courseName={e.courses?.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">ประวัติการดำเนินการ</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['พนักงาน', 'คอร์ส', 'สถานะ', 'วันที่'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(history || []).map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{e.users?.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{e.courses?.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {e.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.approved_at ? formatDateTime(e.approved_at) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!history || history.length === 0) && (
          <p className="text-center py-8 text-sm text-gray-400">ยังไม่มีประวัติ</p>
        )}
      </div>
    </div>
  )
}
