export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: pendingApprovals },
    { data: recentResults },
    { data: courseStats },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('quiz_results')
      .select('*, users(full_name), courses(title)')
      .order('taken_at', { ascending: false }).limit(8),
    supabase.from('courses')
      .select('id, title, pass_score')
      .eq('is_published', true).limit(5),
  ])

  const passRate = recentResults?.length
    ? Math.round(recentResults.filter(r => r.passed).length / recentResults.length * 100)
    : 0

  const stats = [
    { label: 'พนักงานทั้งหมด', value: totalUsers || 0, icon: '👥', color: 'blue' },
    { label: 'คอร์สที่เปิด', value: totalCourses || 0, icon: '📚', color: 'green' },
    { label: 'อัตราผ่านเฉลี่ย', value: `${passRate}%`, icon: '🏆', color: 'amber' },
    { label: 'รออนุมัติ', value: pendingApprovals || 0, icon: '⏳', color: pendingApprovals ? 'red' : 'gray' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">แดชบอร์ด</h1>
        <p className="text-sm text-gray-500 mt-1">ภาพรวมระบบอบรมพนักงาน</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${colorMap[s.color]}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent quiz results */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">ผลสอบล่าสุด</h2>
          <div className="space-y-3">
            {(recentResults || []).slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                  {(r.users as any)?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{(r.users as any)?.full_name}</div>
                  <div className="text-xs text-gray-500 truncate">{(r.courses as any)?.title}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {Math.round(r.score / r.total * 100)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(r.taken_at)}</div>
                </div>
              </div>
            ))}
            {(!recentResults || recentResults.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีผลสอบ</p>
            )}
          </div>
        </div>

        {/* Course list */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">คอร์สที่เปิดใช้งาน</h2>
          <div className="space-y-3">
            {(courseStats || []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm">📚</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{c.title}</div>
                  <div className="text-xs text-gray-500">เกณฑ์ผ่าน {c.pass_score}%</div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">เผยแพร่</span>
              </div>
            ))}
            {(!courseStats || courseStats.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีคอร์ส</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
