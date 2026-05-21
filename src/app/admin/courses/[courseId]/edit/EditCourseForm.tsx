'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditCourseForm({ course }: { course: any }) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    pass_score: course.pass_score || 70,
    is_published: course.is_published || false,
    requires_approval: course.requires_approval || false,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('courses').update(form).eq('id', course.id)
    setLoading(false)
    setSaved(true)
    setTimeout(() => router.push('/admin/courses'), 1000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {saved && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">บันทึกแล้ว กำลังกลับ...</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อคอร์ส *</label>
          <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">เกณฑ์ผ่าน (%)</label>
          <input type="number" min={0} max={100} value={form.pass_score}
            onChange={e => setForm(f => ({ ...f, pass_score: Number(e.target.value) }))}
            className="w-28 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-2">
          {[
            { key: 'is_published', label: 'เผยแพร่คอร์ส' },
            { key: 'requires_approval', label: 'ต้องขออนุมัติ' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <Link href="/admin/courses" className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
