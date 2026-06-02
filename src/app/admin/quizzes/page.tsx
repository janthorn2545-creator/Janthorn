import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteQuizButton from './DeleteQuizButton'

export const dynamic = 'force-dynamic'

export default async function QuizzesPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseId } = await searchParams
  const supabase = await createClient()

  const { data: courses } = await supabase.from('courses').select('id, title').eq('is_published', true)
  const { data: quizzes } = courseId
    ? await supabase.from('quizzes').select('*').eq('course_id', courseId).order('order_index')
    : { data: [] }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">จัดการแบบทดสอบ</h1>
          <p className="text-sm text-gray-500 mt-1">{quizzes?.length || 0} ข้อสอบ</p>
        </div>
        {courseId && (
          <Link href={`/admin/quizzes/new?course=${courseId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + เพิ่มข้อสอบ
          </Link>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(courses || []).map((c: any) => (
          <Link key={c.id} href={`/admin/quizzes?course=${c.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              courseId === c.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}>
            {c.title}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {(quizzes || []).map((q: any, i: number) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900 text-sm">{q.question}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 ml-8">
                  {(q.options as string[]).map((opt, oi) => (
                    <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg ${
                      oi === q.correct_index
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {oi === q.correct_index ? '✓ ' : ''}{opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-500 italic mt-2 ml-8">💡 {q.explanation}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/admin/quizzes/${q.id}/edit?course=${courseId}`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  แก้ไข
                </Link>
                <DeleteQuizButton quizId={q.id} courseId={courseId || ''} />
              </div>
            </div>
          </div>
        ))}
        {courseId && (!quizzes || quizzes.length === 0) && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">ยังไม่มีข้อสอบ กดเพิ่มข้อสอบเพื่อเริ่ม</p>
          </div>
        )}
        {!courseId && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">เลือกคอร์สด้านบนเพื่อดูข้อสอบ</p>
          </div>
        )}
      </div>
    </div>
  )
}
