export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditCourseForm from './EditCourseForm'

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (!course) redirect('/admin/courses')
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">แก้ไขคอร์ส</h1>
      <EditCourseForm course={course} />
    </div>
  )
}
