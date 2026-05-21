'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewCoursePage() {
  const [form, setForm] = useState({
    title: '', description: '', pass_score: 70,
    is_published: false, requires_approval: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('courses').insert({ ...form, created_by: user?.id })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/admin/courses')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/admin/courses" className="hover:text-blue-600">คอร์ส</Link>
        <span>›</span><span className="text-gray-800">เพิ่มคอร์สใหม่</span>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">เพิ่มคอร์สใหม่</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อคอร์ส *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="เช่น ความปลอดภัยในที่ทำงาน"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="อธิบายเนื้อหาและวัตถุประสงค์ของคอร์ส"
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เกณฑ์ผ่าน (%)</label>
            <input type="number" min={0} max={100} value={form.pass_score}
              onChange={e => setForm(f => ({ ...f, pass_score: Number(e.target.value) }))}
              className="w-28 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-2">
            {[
              { key: 'is_published', label: 'เผยแพร่คอร์ส', sub: 'พนักงานจะเห็นคอร์สนี้' },
              { key: 'requires_approval', label: 'ต้องขออนุมัติ', sub: 'พนักงานต้องได้รับอนุมัติก่อนเข้าเรียน' },
            ].map(({ key, label, sub }) => (
              <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <div className="text-sm font-medium text-gray-800">{label}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'กำลังบันทึก...' : 'บันทึกคอร์ส'}
            </button>
            <Link href="/admin/courses"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
