'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteLessonButton({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('lessons').delete().eq('id', lessonId)
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex gap-1">
        <button onClick={handleDelete} disabled={loading}
          className="text-xs text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg disabled:opacity-60">
          {loading ? '...' : 'ยืนยันลบ'}
        </button>
        <button onClick={() => setConfirm(false)}
          className="text-xs text-gray-600 border border-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-50">
          ยกเลิก
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
      ลบ
    </button>
  )
}
