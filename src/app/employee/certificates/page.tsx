export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, courses(title, description)')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ใบรับรองของฉัน</h1>
        <p className="text-sm text-gray-500 mt-1">{certs?.length || 0} ใบรับรองที่ได้รับ</p>
      </div>

      {certs && certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
                <div className="text-3xl mb-2">🎓</div>
                <div className="text-xs font-medium tracking-widest uppercase mb-1 opacity-80">Certificate of Completion</div>
                <div className="text-lg font-semibold">{c.courses?.title}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500">รหัสอ้างอิง</div>
                    <div className="font-mono text-sm font-medium text-blue-700">{c.cert_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">วันที่ออก</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(c.issued_at)}</div>
                  </div>
                </div>
                <a href={`/api/employee/certificate/${c.id}`} target="_blank"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors">
                  ⬇ ดาวน์โหลด PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🎓</div>
          <p className="text-base font-medium text-gray-600 mb-1">ยังไม่มีใบรับรอง</p>
          <p className="text-sm mb-4">ผ่านแบบทดสอบเพื่อรับใบรับรอง</p>
          <Link href="/employee/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition-colors inline-block">
            ไปดูคอร์ส →
          </Link>
        </div>
      )}
    </div>
  )
}
