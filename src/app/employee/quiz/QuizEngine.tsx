'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface Question {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation?: string
}

interface Props {
  courseId: string
  courseTitle: string
  passScore: number
  questions: Question[]
  pastResults: Array<{ score: number; total: number; passed: boolean; taken_at: string }>
}

const MIN_PASS = 80
type State = 'start' | 'quiz' | 'result'

export default function QuizEngine({ courseId, courseTitle, questions, pastResults }: Props) {
  const [state, setState] = useState<State>('start')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const selectAnswer = (idx: number) => {
    if (submitting) return
    const next = [...answers]; next[current] = idx; setAnswers(next)
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    const score = answers.filter((a, i) => a === questions[i].correct_index).length
    const pct = Math.round(score / questions.length * 100)
    const passed = pct >= MIN_PASS

    await fetch('/api/employee/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, score, total: questions.length, passed, answers }),
    })

    setResult({ score: pct, passed })
    setState('result')
    setSubmitting(false)
    router.refresh()
  }

  const restart = () => {
    setCurrent(0)
    setAnswers(new Array(questions.length).fill(null))
    setResult(null)
    setState('quiz')
  }

  if (state === 'start') {
    const best = pastResults.length ? Math.max(...pastResults.map(r => Math.round(r.score / r.total * 100))) : null
    const hasPassed = pastResults.some(r => Math.round(r.score / r.total * 100) >= MIN_PASS)
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-lg font-semibold text-gray-900">{courseTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">{questions.length} ข้อ</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <span className="text-amber-700 text-sm font-medium">เกณฑ์ผ่าน {MIN_PASS}% ขึ้นไป</span>
            <span className="text-amber-600 text-xs">เพื่อรับบัตรผู้รับเหมา</span>
          </div>
        </div>

        {best !== null && (
          <div className="bg-gray-50 rounded-lg p-4 mb-5 text-center">
            <div className="text-sm text-gray-600">คะแนนสูงสุดที่เคยได้</div>
            <div className={`text-2xl font-semibold mt-1 ${best >= MIN_PASS ? 'text-green-600' : 'text-red-500'}`}>{best}%</div>
            {hasPassed && <div className="text-xs text-green-600 mt-1">✓ ผ่านแล้ว — มีบัตรผู้รับเหมา</div>}
          </div>
        )}

        {pastResults.length > 0 && (
          <div className="mb-5">
            <div className="text-xs font-medium text-gray-500 mb-2">ประวัติการสอบ</div>
            <div className="space-y-1.5">
              {pastResults.map((r, i) => {
                const pct = Math.round(r.score / r.total * 100)
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={`w-14 text-center text-xs font-medium py-0.5 rounded ${pct >= MIN_PASS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{pct}%</span>
                    <span className="text-gray-500 text-xs">{formatDate(r.taken_at)}</span>
                    <span className={`text-xs ${pct >= MIN_PASS ? 'text-green-600' : 'text-red-500'}`}>{pct >= MIN_PASS ? 'ผ่าน' : 'ไม่ผ่าน'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={() => setState('quiz')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
          {pastResults.length > 0 ? 'ทำอีกครั้ง' : 'เริ่มทำแบบทดสอบ'} →
        </button>
      </div>
    )
  }

  if (state === 'result' && result) {
    const passed = result.passed
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{passed ? '🎉' : '😔'}</div>
          <h2 className="text-xl font-semibold text-gray-900">{passed ? 'ผ่านแล้ว! ได้รับบัตรผู้รับเหมา' : 'ยังไม่ผ่าน'}</h2>
          <div className={`text-4xl font-bold mt-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>{result.score}%</div>
          <p className="text-sm text-gray-500 mt-1">เกณฑ์ผ่าน {MIN_PASS}%</p>
          {passed
            ? <p className="text-sm text-green-600 mt-2">🪪 บัตรผู้รับเหมาออกให้แล้ว อายุ 1 ปี</p>
            : <p className="text-sm text-gray-500 mt-2">ต้องได้ {MIN_PASS}% ขึ้นไป — ลองทำใหม่ได้เลย</p>
          }
          {!passed && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              ยังไม่สามารถดาวน์โหลดบัตรผู้รับเหมาได้ — ต้องทำแบบทดสอบให้ผ่านก่อน
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-xs font-medium text-gray-500 mb-2">เฉลยคำตอบ</div>
          {questions.map((q, i) => {
            const userAns = answers[i]
            const correct = q.correct_index
            const isRight = userAns === correct
            return (
              <div key={q.id} className={`rounded-lg p-3 text-sm ${isRight ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="font-medium mb-1.5 text-gray-800">ข้อ {i + 1}: {q.question}</div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className={`text-xs py-0.5 px-2 rounded my-0.5 ${
                    oi === correct ? 'text-green-700 font-medium' :
                    oi === userAns && !isRight ? 'text-red-600 line-through' : 'text-gray-600'
                  }`}>
                    {oi === correct ? '✓ ' : oi === userAns && !isRight ? '✗ ' : '  '}{opt}
                  </div>
                ))}
                {q.explanation && <div className="text-xs text-gray-500 mt-1.5 italic">💡 {q.explanation}</div>}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={restart}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
            ทำอีกครั้ง
          </button>
          {passed && (
            <a href="/employee/certificates"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm text-center transition-colors">
              🪪 ดูบัตรผู้รับเหมา
            </a>
          )}
        </div>
      </div>
    )
  }

  const q = questions[current]
  const answered = answers[current] !== null
  const allAnswered = answers.every(a => a !== null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">ข้อ {current + 1} / {questions.length}</span>
        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">เกณฑ์ผ่าน {MIN_PASS}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <h3 className="text-base font-medium text-gray-900 mb-4">{q.question}</h3>

      <div className="space-y-2 mb-6">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => selectAnswer(i)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
              answers[current] === i
                ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}>
            <span className="inline-flex w-6 h-6 rounded-full border mr-2 items-center justify-center text-xs flex-shrink-0 align-middle"
              style={{
                borderColor: answers[current] === i ? '#3b82f6' : '#d1d5db',
                background: answers[current] === i ? '#3b82f6' : 'transparent',
                color: answers[current] === i ? '#fff' : '#9ca3af'
              }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ← ก่อนหน้า
          </button>
        )}
        <div className="flex-1" />
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={!answered}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm">
            ถัดไป →
          </button>
        ) : (
          <button onClick={submitQuiz} disabled={!allAnswered || submitting}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {submitting ? 'กำลังส่ง...' : allAnswered ? '✓ ส่งคำตอบ' : `ยังขาด ${answers.filter(a => a === null).length} ข้อ`}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
              i === current ? 'bg-blue-600 text-white' :
              answers[i] !== null ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'
            }`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
