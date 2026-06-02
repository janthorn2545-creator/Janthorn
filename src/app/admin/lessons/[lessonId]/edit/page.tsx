export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditLessonForm from './EditLessonForm'

export default async function EditLessonPage({ params, searchParams }: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ course?: string }>
}) {
  const { lessonId } = await params
  const { course: courseId } = await searchParams
  const supabase = await createClient()
  const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
  if (!lesson) redirect('/admin/lessons')
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">แก้ไขวิดีโอ</h1>
      <EditLessonForm lesson={lesson} courseId={courseId || ''} />
    </div>
  )
}
