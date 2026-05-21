export const dynamic = 'force-dynamic'
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractYouTubeId } from '@/lib/utils'
import Link from 'next/link'

export default function NewLessonPage() {
  const [form, setForm] = useState({ title: '', description: '', youtube_url: '', duration_sec: 0, order_index: 0 })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const youtubeId = extractYouTubeId(form.youtube_url) || ''
    await supabase.from('lessons').insert({
      course_id: courseId, title: form.title, description: form.description,
      youtube_id: youtubeId, duration_sec: form.duration_sec, order_index: form.order_index,
    })
    router.push(`/admin/lessons?course=${courseId}`)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">เพิ่มวิดีโอ</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบทเรียน *</label>
            <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="เช่น บทที่ 1: บทนำ"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL *</label>
            <input type="text" required value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=xxxxx"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ระยะเวลา (วินาที)</label>
              <input type="number" min={0} value={form.duration_sec} onChange={e => setForm(f => ({ ...f, duration_sec: Number(e.target.value) }))}
                placeholder="เช่น 600 = 10 นาที"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ลำดับที่</label>
              <input type="number" min={0} value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm">
              {loading ? 'กำลังบันทึก...' : 'บันทึกวิดีโอ'}
            </button>
            <Link href={`/admin/lessons?course=${courseId}`}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm">ยกเลิก</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
