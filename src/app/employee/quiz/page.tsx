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
                <div className="text-xs text-gray-500">เกณฑ์ผ่าน {e.courses?.pass_score}%</div>
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

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/employee/quiz" className="hover:text-blue-600">แบบทดสอบ</Link>
        <span>›</span>
        <span className="text-gray-800">{course?.title}</span>
      </div>

      {questions && questions.length > 0 ? (
        <QuizEngine
          courseId={courseId}
          courseTitle={course?.title || ''}
          passScore={course?.pass_score || 70}
          questions={questions}
          pastResults={pastResults || []}
        />
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">ยังไม่มีแบบทดสอบสำหรับคอร์สนี้</p>
        </div>
      )}
    </div>
  )
}
