'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditQuizForm({ quiz, courseId }: { quiz: any; courseId: string }) {
  const [question, setQuestion] = useState(quiz.question || '')
  const [options, setOptions] = useState<string[]>(quiz.options || ['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(quiz.correct_index || 0)
  const [explanation, setExplanation] = useState(quiz.explanation || '')
  const [orderIndex, setOrderIndex] = useState(quiz.order_index || 0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('quizzes').update({
      question,
      options: options.filter(o => o.trim()),
      correct_index: correctIndex,
      explanation,
      order_index: orderIndex,
    }).eq('id', quiz.id)
    setLoading(false)
    setSaved(true)
    setTimeout(() => router.push(`/admin/quizzes?course=${courseId}`), 800)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            บันทึกแล้ว กำลังกลับ...
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">คำถาม *</label>
          <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={2}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ตัวเลือก — คลิก ○ เพื่อเลือกข้อที่ถูก</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)} className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-500 w-6">{String.fromCharCode(65 + i)}.</span>
                <input type="text" value={opt}
                  onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n) }}
                  placeholder={`ตัวเลือก ${String.fromCharCode(65 + i)}`}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    correctIndex === i ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`} />
                {correctIndex === i && <span className="text-xs text-green-600 font-medium">✓ ถูก</span>}
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
          <input type="number" min={0} value={orderIndex}
            onChange={e => setOrderIndex(Number(e.target.value))}
            className="w-28 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <Link href={`/admin/quizzes?course=${courseId}`}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
