'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  enrollmentId: string
  userName: string
  userEmail: string
  courseName: string
}

export default function ApprovalActions({ enrollmentId, userName, userEmail, courseName }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [note, setNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    await fetch('/api/admin/enrollments/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, action, note, userEmail, userName, courseName }),
    })
    setLoading(null)
    setShowReject(false)
    router.refresh()
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="เหตุผลในการปฏิเสธ (ไม่บังคับ)"
          className="w-full text-xs border border-gray-300 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button onClick={() => handleAction('reject')} disabled={!!loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded-lg disabled:opacity-60">
            {loading === 'reject' ? '...' : 'ยืนยันปฏิเสธ'}
          </button>
          <button onClick={() => setShowReject(false)}
            className="flex-1 border border-gray-300 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-gray-50">
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button onClick={() => handleAction('approve')} disabled={!!loading}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
        {loading === 'approve' ? '...' : '✓ อนุมัติ'}
      </button>
      <button onClick={() => setShowReject(true)} disabled={!!loading}
        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
        ✕ ปฏิเสธ
      </button>
    </div>
  )
}
