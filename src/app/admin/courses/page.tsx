export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, lessons(count), enrollments(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">คอร์สทั้งหมด</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการและเพิ่มคอร์สการอบรม</p>
        </div>
        <Link href="/admin/courses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
          + เพิ่มคอร์สใหม่
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['คอร์ส', 'บทเรียน', 'ผู้เรียน', 'เกณฑ์ผ่าน', 'สถานะ', 'สร้างเมื่อ', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(courses || []).map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{c.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.lessons?.[0]?.count || 0}</td>
                <td className="px-4 py-3 text-gray-600">{c.enrollments?.[0]?.count || 0}</td>
                <td className="px-4 py-3 text-gray-600">{c.pass_score}%</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.is_published ? 'เผยแพร่' : 'ร่าง'}
                  </span>
                  {c.requires_approval && (
                    <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ต้องอนุมัติ</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${c.id}/edit`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">แก้ไข</Link>
                    <Link href={`/admin/lessons?course=${c.id}`}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium">วิดีโอ</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!courses || courses.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-1">📚</p>
            <p className="text-sm">ยังไม่มีคอร์ส กดเพิ่มคอร์สใหม่เพื่อเริ่ม</p>
          </div>
        )}
      </div>
    </div>
  )
}
