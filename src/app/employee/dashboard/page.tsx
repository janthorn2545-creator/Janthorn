export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .eq('status', 'approved')

  const { data: results } = await supabase
    .from('quiz_results')
    .select('*, courses(title)')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false })
    .limit(5)

  const { count: certCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const totalCourses = enrollments?.length || 0
  const avgScore = results?.length
    ? Math.round(results.reduce((s, r) => s + Math.round(r.score / r.total * 100), 0) / results.length)
    : 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">สวัสดี, {profile?.full_name} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.department || 'พนักงาน'}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'คอร์สที่ลงทะเบียน', value: totalCourses, icon: '📚' },
          { label: 'คะแนนเฉลี่ย', value: avgScore ? `${avgScore}%` : '—', icon: '🎯' },
          { label: 'ใบเซอร์ที่ได้', value: certCount || 0, icon: '🎓' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">คอร์สของฉัน</h2>
            <Link href="/employee/courses" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="space-y-3">
            {(enrollments || []).slice(0, 4).map((e: any) => (
              <Link key={e.id} href={`/employee/courses/${e.course_id}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">📚</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{e.courses?.title}</div>
                  <div className="text-xs text-gray-500">เกณฑ์ผ่าน {e.courses?.pass_score}%</div>
                </div>
              </Link>
            ))}
            {(!enrollments || enrollments.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีคอร์ส</p>
            )}
          </div>
        </div>

        {/* Recent scores */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">ผลสอบล่าสุด</h2>
            <Link href="/employee/quiz" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="space-y-3">
            {(results || []).map(r => {
              const pct = Math.round(r.score / r.total * 100)
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate">{(r.courses as any)?.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(r.taken_at)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {r.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                  </span>
                </div>
              )
            })}
            {(!results || results.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีผลสอบ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
