export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const completedCount = (progress || []).filter(p => p.completed).length
  const progressPct = lessons?.length ? Math.round(completedCount / lessons.length * 100) : 0

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/employee/courses" className="hover:text-blue-600">คอร์สของฉัน</Link>
        <span>›</span>
        <span className="text-gray-800">{course?.title}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">{course?.title}</h1>
          <p className="text-sm text-gray-600">{course?.description}</p>
        </div>

        {lessons && lessons.length > 0 ? (
          <VideoPlayer
            lessons={lessons}
            userId={user.id}
            courseId={courseId}
            initialProgress={progress || []}
          />
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-sm">ยังไม่มีบทเรียน</p>
          </div>
        )}
      </div>

      {progressPct >= 80 && (
        <Link href={`/employee/quiz?course=${courseId}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl text-center transition-colors">
          📝 ทำแบบทดสอบ (เกณฑ์ผ่าน 80%) →
        </Link>
      )}
    </div>
  )
}
