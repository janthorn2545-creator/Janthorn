import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDuration, getYouTubeEmbedUrl } from '@/lib/utils'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer'

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase
    .from('enrollments').select('*')
    .eq('user_id', user.id).eq('course_id', courseId).eq('status', 'approved').single()

  if (!enrollment) redirect('/employee/courses')

  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  const { data: lessons } = await supabase
    .from('lessons').select('*').eq('course_id', courseId).order('order_index')
  const { data: progress } = await supabase
    .from('lesson_progress').select('*').eq('user_id', user.id)
    .in('lesson_id', (lessons || []).map(l => l.id))

  const progressMap = Object.fromEntries((progress || []).map(p => [p.lesson_id, p]))
  const completedCount = (progress || []).filter(p => p.completed).length
  const progressPct = lessons?.length ? Math.round(completedCount / lessons.length * 100) : 0
  const firstLesson = lessons?.[0]

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/employee/courses" className="hover:text-blue-600">คอร์สของฉัน</Link>
        <span>›</span>
        <span className="text-gray-800">{course?.title}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-sm text-gray-600 mb-4">{course?.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-sm font-medium text-gray-700">{progressPct}%</span>
            <span className="text-xs text-gray-500">{completedCount}/{lessons?.length || 0} บท</span>
          </div>
        </div>

        {firstLesson && (
          <VideoPlayer lesson={firstLesson} userId={user.id} courseId={courseId} />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-gray-100 text-sm font-medium text-gray-700">
          บทเรียนทั้งหมด ({lessons?.length || 0} บท)
        </div>
        <div className="divide-y divide-gray-100">
          {(lessons || []).map((lesson, i) => {
            const lp = progressMap[lesson.id]
            return (
              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  lp?.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {lp?.completed ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">{lesson.title}</div>
                  <div className="text-xs text-gray-400">{formatDuration(lesson.duration_sec)}</div>
                </div>
                {lp?.completed && <span className="text-xs text-green-600">✓ เสร็จแล้ว</span>}
              </div>
            )
          })}
        </div>
      </div>

      {progressPct >= 80 && (
        <Link href={`/employee/quiz?course=${courseId}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl text-center transition-colors">
          📝 ทำแบบทดสอบ →
        </Link>
      )}
    </div>
  )
}
