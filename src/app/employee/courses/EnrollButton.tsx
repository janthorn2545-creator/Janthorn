'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  courseId: string
  courseName: string
  requiresApproval: boolean
}

export default function EnrollButton({ courseId, courseName, requiresApproval }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setLoading(true)
    await fetch('/api/employee/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, courseName }),
    })
    setLoading(false)
    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="text-xs text-center text-green-700 bg-green-50 py-2 rounded-lg">
        {requiresApproval ? '✓ ส่งคำขอแล้ว รอการอนุมัติ' : '✓ ลงทะเบียนแล้ว'}
      </div>
    )
  }

  return (
    <button onClick={handleEnroll} disabled={loading}
      className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
      {loading ? '...' : requiresApproval ? '📋 ขอสิทธิ์เข้าเรียน' : '+ ลงทะเบียน'}
    </button>
  )
}
