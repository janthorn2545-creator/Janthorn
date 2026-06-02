export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import AddUserButton from './AddUserButton'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users').select('*').eq('role', 'employee')
    .order('created_at', { ascending: false })

  const { data: certs } = await supabase
    .from('certificates').select('user_id, cert_code, issued_at, course_id')

  const { data: results } = await supabase
    .from('quiz_results').select('user_id, score, total, passed, taken_at')

  const { data: progress } = await supabase
    .from('lesson_progress').select('user_id, completed')

  const { data: enrollments } = await supabase
    .from('enrollments').select('user_id, status, course_id')

  const certMap: Record<string, any[]> = {}
  ;(certs||[]).forEach((c:any) => { if(!certMap[c.user_id]) certMap[c.user_id]=[]; certMap[c.user_id].push(c) })

  const resultMap: Record<string, any[]> = {}
  ;(results||[]).forEach((r:any) => { if(!resultMap[r.user_id]) resultMap[r.user_id]=[]; resultMap[r.user_id].push(r) })

  const progressMap: Record<string, number> = {}
  ;(progress||[]).forEach((p:any) => { if(p.completed) progressMap[p.user_id] = (progressMap[p.user_id]||0)+1 })

  const enrollMap: Record<string, number> = {}
  ;(enrollments||[]).forEach((e:any) => { if(e.status==='approved') enrollMap[e.user_id] = (enrollMap[e.user_id]||0)+1 })

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ข้อมูลพนักงาน</h1>
          <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด {users?.length||0} คน</p>
        </div>
        <AddUserButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'พนักงานทั้งหมด', value: users?.length||0, color: 'blue' },
          { label: 'มีบัตรผู้รับเหมา', value: Object.keys(certMap).length, color: 'green' },
          { label: 'กำลังอบรม', value: Object.keys(enrollMap).length, color: 'amber' },
          { label: 'ผ่านแบบทดสอบ', value: (results||[]).filter((r:any)=>r.passed).length, color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${
            s.color==='blue'?'bg-blue-50': s.color==='green'?'bg-green-50':
            s.color==='amber'?'bg-amber-50':'bg-purple-50'}`}>
            <div className={`text-2xl font-semibold ${
              s.color==='blue'?'text-blue-700': s.color==='green'?'text-green-700':
              s.color==='amber'?'text-amber-700':'text-purple-700'}`}>{s.value}</div>
            <div className={`text-xs mt-0.5 ${
              s.color==='blue'?'text-blue-600': s.color==='green'?'text-green-600':
              s.color==='amber'?'text-amber-600':'text-purple-600'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {(users||[]).map((u:any) => {
          const userCerts = certMap[u.id]||[]
          const userResults = resultMap[u.id]||[]
          const completedLessons = progressMap[u.id]||0
          const userEnrolls = enrollMap[u.id]||0
          const passedCount = userResults.filter((r:any)=>r.passed).length
          const avgScore = userResults.length
            ? Math.round(userResults.reduce((s:number,r:any)=>s+Math.round(r.score/r.total*100),0)/userResults.length)
            : null
          const activeCert = userCerts.find((c:any) => {
            const exp = new Date(c.issued_at); exp.setFullYear(exp.getFullYear()+1)
            return exp > new Date()
          })

          return (
            <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {u.photo_url
                    ? <img src={u.photo_url} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
                    : <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
                        {u.full_name?.charAt(0)||'?'}
                      </div>
                  }
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{u.full_name}</span>
                    {activeCert
                      ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">🪪 มีบัตรใช้งานได้</span>
                      : userCerts.length > 0
                      ? <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">บัตรหมดอายุ</span>
                      : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">ยังไม่มีบัตร</span>
                    }
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{u.email}</div>
                  <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                    {u.company_name && <span>🏢 {u.company_name}</span>}
                    {u.department && <span>📂 {u.department}</span>}
                    {u.position && <span>💼 {u.position}</span>}
                  </div>
                </div>

                {/* Detail link */}
                <Link href={`/admin/users/${u.id}`}
                  className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  ดูรายละเอียด →
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
                {[
                  { icon: '📚', label: 'คอร์สที่เรียน', value: userEnrolls },
                  { icon: '🎬', label: 'บทเรียนที่ดู', value: completedLessons },
                  { icon: '📝', label: 'ครั้งที่สอบ', value: userResults.length },
                  { icon: '🏆', label: 'คะแนนเฉลี่ย', value: avgScore !== null ? `${avgScore}%` : '—' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-base">{stat.icon}</div>
                    <div className="text-sm font-semibold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Cert info */}
              {activeCert && (
                <div className="mt-2 bg-green-50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <div className="text-xs text-green-700">
                    <span className="font-medium">บัตร: {activeCert.cert_code}</span>
                    <span className="ml-2 text-green-600">ออกเมื่อ {formatDate(activeCert.issued_at)}</span>
                  </div>
                  <div className="text-xs text-green-600">
                    หมดอายุ {formatDate(new Date(new Date(activeCert.issued_at).setFullYear(new Date(activeCert.issued_at).getFullYear()+1)).toISOString())}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {(!users||users.length===0) && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm">ยังไม่มีพนักงาน</p>
          </div>
        )}
      </div>
    </div>
  )
}
