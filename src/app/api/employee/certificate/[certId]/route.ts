import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCertificateHTML } from '@/lib/certificate'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  const { certId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cert } = await supabase
    .from('certificates')
    .select('*, users(full_name), courses(title)')
    .eq('id', certId)
    .single()

  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Security: only own cert or admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (cert.user_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const html = getCertificateHTML({
    full_name: (cert.users as any).full_name,
    course_title: (cert.courses as any).title,
    cert_code: cert.cert_code,
    issued_at: cert.issued_at,
  })

  // Return as HTML (can be printed to PDF in browser, or use headless Chrome on server)
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="certificate-${cert.cert_code}.html"`,
    },
  })
}
