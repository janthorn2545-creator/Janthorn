export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function ScoresPage() {
  const supabase = await createClient()

  const { data: results } = await supabase
    .from('quiz_results')
    .select('*, users(full_name, department), courses(title, pass_score)')
    .order('taken_at', { ascending: false })
    .limit(50)

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, users(full_name), courses(title)')
    .order('issued_at', { ascending: false })
    .limit(20)

  const totalPassed = (results || []).filter(r => r.passed).length
  const passRate = results?.length ? Math.round(totalPassed / results.length * 100) : 0
  const avgScore = results?.length
    ? Math.round(results.reduce((sum, r) => sum + Math.round(r.score / r.total * 100), 0) / results.length)
    : 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">คะแนน & รายงาน</h1>
          <p className="text-sm text-gray-500 mt-1">ผลการสอบและใบรับรองทั้งหมด</p>
        </div>
        <a href="/api/admin/export/results" download
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
          ⬇ ส่งออก CSV
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'ผลสอบทั้งหมด', value: results?.length || 0, icon: '📊' },
          { label: 'อัตราผ่าน', value: `${passRate}%`, icon: '✅' },
          { label: 'คะแนนเฉลี่ย', value: `${avgScore}%`, icon: '🎯' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">ผลการสอบล่าสุด</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['พนักงาน', 'แผนก', 'คอร์ส', 'คะแนน', 'ผล', 'วันที่'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(results || []).map((r: any) => {
                const pct = Math.round(r.score / r.total * 100)
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.users?.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.users?.department || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.courses?.title}</td>
                    <td className="px-4 py-3 font-medium">{r.score}/{r.total} ({pct}%)</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.taken_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!results || results.length === 0) && (
            <p className="text-center py-8 text-sm text-gray-400">ยังไม่มีข้อมูลผลสอบ</p>
          )}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">🎓 ใบรับรองที่ออกแล้ว</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{certs?.length || 0}</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['พนักงาน', 'คอร์ส', 'รหัสใบเซอร์', 'วันที่ออก'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(certs || []).map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.users?.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{c.courses?.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.cert_code}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.issued_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!certs || certs.length === 0) && (
          <p className="text-center py-8 text-sm text-gray-400">ยังไม่มีใบรับรองที่ออก</p>
        )}
      </div>
    </div>
  )
}
