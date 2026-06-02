export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminCardControls from './AdminCardControls'

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: { user: me } } = await supabase.auth.getUser()
  if (!me) redirect('/auth/login')
  const { data: myProfile } = await supabase.from('users').select('role').eq('id', me.id).single()
  if (myProfile?.role !== 'admin') redirect('/employee/dashboard')

  const { data: u } = await supabase.from('users').select('*').eq('id', userId).single()
  if (!u) redirect('/admin/users')

  const { data: certs } = await supabase
    .from('certificates').select('*, courses(title)')
    .eq('user_id', userId).order('issued_at', { ascending: false })

  const { data: results } = await supabase
    .from('quiz_results').select('*, courses(title)')
    .eq('user_id', userId).order('taken_at', { ascending: false })

  const { data: enrollments } = await supabase
    .from('enrollments').select('*, courses(title, pass_score)')
    .eq('user_id', userId).order('enrolled_at', { ascending: false })

  const { data: lessonProgress } = await supabase
    .from('lesson_progress').select('*, lessons(title, courses(title))')
    .eq('user_id', userId).eq('completed', true)
    .order('completed_at', { ascending: false }).limit(20)

  const passedCount = (results||[]).filter((r:any) => r.passed).length
  const avgScore = results?.length
    ? Math.round((results as any[]).reduce((s,r) => s + Math.round(r.score/r.total*100), 0) / results.length)
    : 0

  const activeCerts = (certs||[]).filter((c:any) => {
    const exp = new Date(c.issued_at)
    exp.setFullYear(exp.getFullYear() + 1)
    return exp > new Date()
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/admin/users" className="hover:text-blue-600">พนักงาน</Link>
        <span>›</span>
        <span className="text-gray-800">{u.full_name}</span>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {u.photo_url
            ? <img src={u.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
            : <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                {u.full_name?.charAt(0)||'?'}
              </div>
          }
          <div>
            <div className="text-lg font-semibold text-gray-900">{u.full_name}</div>
            <div className="text-sm text-gray-500">{u.email}</div>
            <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
              {u.company_name && <span>🏢 {u.company_name}</span>}
              {u.department && <span>📂 {u.department}</span>}
              {u.position && <span>💼 {u.position}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'คอร์สที่เรียน', value: (enrollments||[]).filter((e:any) => e.status==='approved').length, icon: '📚', color: 'blue' },
            { label: 'บทเรียนที่ดูจบ', value: lessonProgress?.length||0, icon: '🎬', color: 'teal' },
            { label: 'คะแนนเฉลี่ย', value: avgScore ? `${avgScore}%` : '—', icon: '🎯', color: 'amber' },
            { label: 'บัตรที่ใช้งานได้', value: activeCerts.length, icon: '🪪', color: 'green' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-3 text-center ${
              s.color==='blue'?'bg-blue-50': s.color==='teal'?'bg-teal-50':
              s.color==='amber'?'bg-amber-50':'bg-green-50'}`}>
              <div className="text-xl">{s.icon}</div>
              <div className={`text-xl font-semibold mt-0.5 ${
                s.color==='blue'?'text-blue-700': s.color==='teal'?'text-teal-700':
                s.color==='amber'?'text-amber-700':'text-green-700'}`}>{s.value}</div>
              <div className={`text-xs ${
                s.color==='blue'?'text-blue-600': s.color==='teal'?'text-teal-600':
                s.color==='amber'?'text-amber-600':'text-green-600'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificates with download */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">🪪 ใบอนุญาตผู้รับเหมา</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{certs?.length||0}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {(certs||[]).map((c:any) => {
              const exp = new Date(c.issued_at)
              exp.setFullYear(exp.getFullYear() + 1)
              const isExpired = exp < new Date()
              return (
                <div key={c.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-medium text-blue-700">{c.cert_code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {isExpired ? 'หมดอายุ' : 'ใช้งานได้'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{(c.courses as any)?.title}</div>
                  <div className="flex gap-3 text-xs text-gray-400 mb-2">
                    <span>ออก {formatDate(c.issued_at)}</span>
                    <span className={isExpired ? 'text-red-400' : ''}>หมด {formatDate(exp.toISOString())}</span>
                  </div>
                  {/* Download controls */}
                  <AdminCardControls certId={c.id} isExpired={isExpired} />
                </div>
              )
            })}
            {(!certs||certs.length===0) && (
              <p className="text-center py-6 text-sm text-gray-400">ยังไม่มีบัตร</p>
            )}
          </div>
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">📚 การลงทะเบียนเรียน</span>
          </div>
          <div className="divide-y divide-gray-100">
            {(enrollments||[]).map((e:any) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-800">{(e.courses as any)?.title}</div>
                  <div className="text-xs text-gray-400">{formatDate(e.enrolled_at)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  e.status==='approved' ? 'bg-green-100 text-green-700' :
                  e.status==='pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                  {e.status==='approved' ? 'อนุมัติ' : e.status==='pending' ? 'รอ' : 'ปฏิเสธ'}
                </span>
              </div>
            ))}
            {(!enrollments||enrollments.length===0) && (
              <p className="text-center py-6 text-sm text-gray-400">ยังไม่มี</p>
            )}
          </div>
        </div>

        {/* Quiz results */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">📝 ประวัติการทำแบบทดสอบ</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{results?.length||0} ครั้ง</span>
          </div>
          <div className="divide-y divide-gray-100">
            {(results||[]).slice(0,10).map((r:any) => {
              const pct = Math.round(r.score/r.total*100)
              return (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate">{(r.courses as any)?.title}</div>
                    <div className="text-xs text-gray-400">{formatDateTime(r.taken_at)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {r.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                  </span>
                </div>
              )
            })}
            {(!results||results.length===0) && (
              <p className="text-center py-6 text-sm text-gray-400">ยังไม่มีประวัติ</p>
            )}
          </div>
        </div>

        {/* Lesson progress */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">🎬 บทเรียนที่ดูแล้ว</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{lessonProgress?.length||0} บท</span>
          </div>
          <div className="divide-y divide-gray-100">
            {(lessonProgress||[]).slice(0,10).map((p:any) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{(p.lessons as any)?.title}</div>
                  <div className="text-xs text-gray-400">{(p.lessons as any)?.courses?.title}</div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {p.completed_at ? formatDate(p.completed_at) : '—'}
                </div>
              </div>
            ))}
            {(!lessonProgress||lessonProgress.length===0) && (
              <p className="text-center py-6 text-sm text-gray-400">ยังไม่มีประวัติ</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-500 mb-2">ข้อมูลบัญชี</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>สมัครเมื่อ: <span className="font-medium">{formatDate(u.created_at)}</span></div>
          <div>อัปเดตล่าสุด: <span className="font-medium">{formatDate(u.updated_at)}</span></div>
        </div>
      </div>
    </div>
  )
}
