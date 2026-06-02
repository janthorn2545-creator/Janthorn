import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendCertificateIssued } from '@/lib/email'
import { generateCertCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, score, total, passed, answers } = await req.json()
  const pct = Math.round(score / total * 100)

  // บังคับต้องได้ 80% ขึ้นไป
  const MIN_PASS = 80
  const actualPassed = pct >= MIN_PASS

  const admin = await createAdminClient()

  // บันทึกผลสอบ
  const { error: resultError } = await admin.from('quiz_results').insert({
    user_id: user.id,
    course_id: courseId,
    score,
    total,
    passed: actualPassed,
    answers,
  })
  if (resultError) return NextResponse.json({ error: resultError.message }, { status: 500 })

  let certCode: string | null = null

  // ออกบัตรเฉพาะเมื่อได้ 80% ขึ้นไป
  if (actualPassed) {
    const { data: existingCert } = await admin.from('certificates')
      .select('cert_code').eq('user_id', user.id).eq('course_id', courseId).single()

    if (!existingCert) {
      certCode = generateCertCode()
      const { error: certError } = await admin.from('certificates').insert({
        user_id: user.id,
        course_id: courseId,
        cert_code: certCode,
      })

      if (!certError) {
        const { data: profile } = await admin.from('users').select('full_name, email').eq('id', user.id).single()
        const { data: course } = await admin.from('courses').select('title').eq('id', courseId).single()
        if (profile && course) {
          try {
            await sendCertificateIssued(
              profile.email, profile.full_name, course.title,
              certCode, `${process.env.NEXT_PUBLIC_APP_URL}/employee/certificates`
            )
          } catch (e) { console.error('Email error:', e) }
        }
      }
    } else {
      certCode = existingCert.cert_code
    }
  }

  return NextResponse.json({ success: true, passed: actualPassed, score: pct, certCode })
}
