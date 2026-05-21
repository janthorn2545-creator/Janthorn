export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EnrollButton from './EnrollButton'

export default async function EmployeeCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)

  const { data: certs } = await supabase
    .from('certificates')
    .select('course_id')
    .eq('user_id', user.id)

  const enrollMap = Object.fromEntries((enrollments || []).map(e => [e.course_id, e]))
  const certSet = new Set((certs || []).map(c => c.course_id))

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">คอร์สการอบรม</h1>
        <p className="text-sm text-gray-500 mt-1">เลือกคอร์สที่ต้องการเรียน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(courses || []).map((c: any) => {
          const enrollment = enrollMap[c.id]
          const hasCert = certSet.has(c.id)

          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors">
              <div className="h-24 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-3xl">
                📚
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span>เกณฑ์ผ่าน {c.pass_score}%</span>
                  {c.requires_approval && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ต้องขออนุมัติ</span>}
                </div>

                {hasCert ? (
                  <div className="flex gap-2">
                    <Link href={`/employee/courses/${c.id}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg text-center transition-colors">
                      🎓 ดูใบเซอร์
                    </Link>
                  </div>
                ) : enrollment?.status === 'approved' ? (
                  <Link href={`/employee/courses/${c.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg text-center transition-colors">
                    เข้าเรียน →
                  </Link>
                ) : enrollment?.status === 'pending' ? (
                  <div className="text-xs text-center text-amber-700 bg-amber-50 py-2 rounded-lg">⏳ รอการอนุมัติ</div>
                ) : enrollment?.status === 'rejected' ? (
                  <div className="text-xs text-center text-red-600 bg-red-50 py-2 rounded-lg">❌ ไม่ผ่านการอนุมัติ</div>
                ) : (
                  <EnrollButton courseId={c.id} courseName={c.title} requiresApproval={c.requires_approval} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {(!courses || courses.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm">ยังไม่มีคอร์สที่เปิดใช้งาน</p>
        </div>
      )}
    </div>
  )
}
