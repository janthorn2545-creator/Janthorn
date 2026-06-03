export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import QuizEngine from './QuizEngine'
import Link from 'next/link'

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (!courseId) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(id, title, pass_score)')
      .eq('user_id', user.id)
      .eq('status', 'approved')

    return (
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">แบบทดสอบ</h1>
          <p className="text-sm text-gray-500 mt-1">เลือกคอร์สที่ต้องการทำแบบทดสอบ</p>
        </div>
        <div className="grid gap-3">
          {(enrollments || []).map((e: any) => (
            <Link key={e.course_id} href={`/employee/quiz?course=${e.course_id}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-4 flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📝</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{e.courses?.title}</div>
                <div className="text-xs text-gray-500">เกณฑ์ผ่าน {e.courses?.pass_score || 80}%</div>
              </div>
              <span className="text-blue-600 text-sm">→</span>
            </Link>
          ))}
          {(!enrollments || enrollments.length === 0) && (
            <p className="text-center py-8 text-gray-400 text-sm">ยังไม่มีคอร์สที่ลงทะเบียน</p>
          )}
        </div>
      </div>
    )
  }

  const { data: course } = await supabase
    .from('courses').select('*').eq('id', courseId).single()

  const { data: questions } = await supabase
    .from('quizzes').select('*').eq('course_id', courseId).order('order_index')

  const { data: pastResults } = await supabase
    .from('quiz_results').select('*').eq('user_id', user.id).eq('course_id', courseId)
    .order('taken_at', { ascending: false }).limit(5)

  // ตรวจสอบบทเรียนทั้งหมดและ progress
  const { data: lessons } = await supabase
    .from('lessons').select('id').eq('course_id', courseId)

  const totalLessons = lessons?.length || 0

  const { data: progress } = await supabase
    .from('lesson_progress').select('lesson_id, completed')
    .eq('user_id', user.id)
    .eq('completed', true)
    .in('lesson_id', (lessons || []).map((l: any) => l.id))

  const completedLessons = progress?.length || 0
  const progressPct = totalLessons > 0 ? Math.round(completedLessons / totalLessons * 100) : 0
  const canTakeQuiz = totalLessons === 0 || progressPct >= 100

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/employee/quiz" className="hover:text-blue-600">แบบทดสอบ</Link>
        <span>›</span>
        <span className="text-gray-800">{course?.title}</span>
      </div>

      {/* บล็อกถ้ายังดูวิดีโอไม่จบ */}
      {!canTakeQuiz ? (
        <div className="bg-white rounded-xl border border-amber-300 overflow-hidden">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-200 flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <div className="font-semibold text-amber-900">ยังไม่สามารถทำแบบทดสอบได้</div>
              <div className="text-sm text-amber-700 mt-0.5">ต้องดูวิดีโออบรมให้ครบทุกบทก่อน</div>
            </div>
          </div>
          <div className="p-6">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">ความคืบหน้าการเรียน</span>
                <span className={`font-semibold ${progressPct === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                  {completedLessons} / {totalLessons} บท ({progressPct}%)
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-5 text-sm text-amber-800">
              <div className="font-medium mb-1">📋 เงื่อนไขการทำแบบทดสอบ</div>
              <div className="space-y-1 text-amber-700">
                <div className="flex items-center gap-2">
                  <span className={progressPct === 100 ? 'text-green-600' : 'text-amber-500'}>
                    {progressPct === 100 ? '✅' : '⏳'}
                  </span>
                  ดูวิดีโออบรมครบทุกบท ({completedLessons}/{totalLessons} บท)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">⏳</span>
                  ทำแบบทดสอบและได้คะแนน 80% ขึ้นไป
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">⏳</span>
                  รับบัตรผู้รับเหมา (อายุ 1 ปี)
                </div>
              </div>
            </div>

            {/* ยังเหลือกี่บท */}
            <div className="bg-white border border-amber-200 rounded-lg p-3 mb-5 text-sm">
              <span className="text-amber-700">
                ยังเหลืออีก <strong>{totalLessons - completedLessons} บท</strong> ที่ยังไม่ได้ดู
              </span>
            </div>

            <Link href={`/employee/courses/${courseId}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-center transition-colors">
              🎬 ไปดูวิดีโออบรมต่อ →
            </Link>
          </div>
        </div>
      ) : questions && questions.length > 0 ? (
        <QuizEngine
          courseId={courseId}
          courseTitle={course?.title || ''}
          passScore={80}
          questions={questions}
          pastResults={pastResults || []}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">ยังไม่มีแบบทดสอบสำหรับคอร์สนี้</p>
        </div>
      )}
    </div>
  )
}
