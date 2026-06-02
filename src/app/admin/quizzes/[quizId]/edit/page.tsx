export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditQuizForm from './EditQuizForm'

export default async function EditQuizPage({ params, searchParams }: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ course?: string }>
}) {
  const { quizId } = await params
  const { course: courseId } = await searchParams
  const supabase = await createClient()
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
  if (!quiz) redirect('/admin/quizzes')
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">แก้ไขข้อสอบ</h1>
      <EditQuizForm quiz={quiz} courseId={courseId || ''} />
    </div>
  )
}
