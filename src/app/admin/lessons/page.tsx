export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'
import DeleteLessonButton from './DeleteLessonButton'

export default async function LessonsPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseId } = await searchParams
  const supabase = await createClient()

  const { data: courses } = await supabase.from('courses').select('id, title').eq('is_published', true)
  const { data: lessons } = courseId
    ? await supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index')
    : { data: [] }
  const selectedCourse = courses?.find((c: any) => c.id === courseId)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">จัดการวิดีโอ</h1>
          <p className="text-sm text-gray-500 mt-1">{selectedCourse ? selectedCourse.title : 'เลือกคอร์สก่อน'}</p>
        </div>
        {courseId && (
          <Link href={`/admin/lessons/new?course=${courseId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + เพิ่มวิดีโอ
          </Link>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(courses || []).map((c: any) => (
          <Link key={c.id} href={`/admin/lessons?course=${c.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              courseId === c.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}>
            {c.title}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {courseId && lessons && lessons.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ลำดับ', 'ชื่อบทเรียน', 'YouTube ID', 'ระยะเวลา', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{l.order_index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{l.title}</td>
                  <td className="px-4 py-3">
                    {l.youtube_id ? (
                      <span className="font-mono text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">{l.youtube_id}</span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDuration(l.duration_sec)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/lessons/${l.id}/edit?course=${courseId}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                        แก้ไข
                      </Link>
                      <DeleteLessonButton lessonId={l.id} courseId={courseId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🎬</p>
            <p className="text-sm">{courseId ? 'ยังไม่มีวิดีโอในคอร์สนี้' : 'เลือกคอร์สด้านบนเพื่อดูวิดีโอ'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
