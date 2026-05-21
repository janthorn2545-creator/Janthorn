'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function NewQuizForm() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('quizzes').insert({
      course_id: courseId, question,
      options: options.filter(o => o.trim()),
      correct_index: correctIndex,
      explanation, order_index: orderIndex,
    })
    router.push(`/admin/quizzes?course=${courseId}`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">คำถาม *</label>
          <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={2}
            placeholder="พิมพ์คำถามที่นี่..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ตัวเลือก — คลิก ○ เพื่อเลือกข้อที่ถูก</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-500 w-6">{String.fromCharCode(65+i)}.</span>
                <input type="text" value={opt} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n) }}
                  placeholder={`ตัวเลือก ${String.fromCharCode(65+i)}`}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${correctIndex===i?'border-green-400 bg-green-50':'border-gray-300'}`} />
                {correctIndex===i && <span className="text-xs text-green-600 font-medium">✓ ถูก</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบายเฉลย (ไม่บังคับ)</label>
          <input type="text" value={explanation} onChange={e => setExplanation(e.target.value)}
            placeholder="อธิบายเหตุผลของคำตอบที่ถูก"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ลำดับข้อที่</label>
          <input type="number" min={0} value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))}
            className="w-28 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm">
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อสอบ'}
          </button>
          <Link href={`/admin/quizzes?course=${courseId}`}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NewQuizPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">เพิ่มข้อสอบ</h1>
      <Suspense fallback={<div>loading...</div>}><NewQuizForm /></Suspense>
    </div>
  )
}
