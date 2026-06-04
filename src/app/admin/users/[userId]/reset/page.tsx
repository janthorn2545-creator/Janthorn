export const dynamic = 'force-dynamic'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ course?: string; action?: string }>
}) {
  const { userId } = await params
  const { course: courseId, action } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'superadmin'].includes(profile?.role || '')) {
    redirect('/employee/dashboard')
  }

  if (courseId && action) {
    const admin = await createAdminClient()

    if (action === 'reset_quiz' || action === 'reset_all_course') {
      await admin.from('quiz_results').delete()
        .eq('user_id', userId).eq('course_id', courseId)
      await admin.from('certificates').delete()
        .eq('user_id', userId).eq('course_id', courseId)
    }

    if (action === 'reset_progress' || action === 'reset_all_course') {
      const { data: lessons } = await admin.from('lessons')
        .select('id').eq('course_id', courseId)
      const ids = (lessons || []).map((l: any) => l.id)
      if (ids.length > 0) {
        await admin.from('lesson_progress').delete()
          .eq('user_id', userId).in('lesson_id', ids)
      }
    }

    if (action === 'reset_all_course') {
      await admin.from('enrollments').delete()
        .eq('user_id', userId).eq('course_id', courseId)
    }
  }

  redirect(`/admin/users/${userId}`)
}
