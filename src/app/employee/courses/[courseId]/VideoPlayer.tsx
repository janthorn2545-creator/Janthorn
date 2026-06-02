'use client'
import { useState } from 'react'
import { getYouTubeEmbedUrl, formatDuration } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  youtube_id?: string
  duration_sec: number
  order_index: number
}

interface Progress {
  lesson_id: string
  completed: boolean
}

interface Props {
  lessons: Lesson[]
  userId: string
  courseId: string
  initialProgress: Progress[]
}

export default function VideoPlayer({ lessons, userId, courseId, initialProgress }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>(
    Object.fromEntries(initialProgress.map(p => [p.lesson_id, p.completed]))
  )

  const currentLesson = lessons[currentIdx]

  const markComplete = async (lessonId: string) => {
    if (progressMap[lessonId]) return
    setProgressMap(prev => ({ ...prev, [lessonId]: true }))
    await fetch('/api/employee/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed: true }),
    })
  }

  const completedCount = Object.values(progressMap).filter(Boolean).length
  const progressPct = lessons.length ? Math.round(completedCount / lessons.length * 100) : 0

  return (
    <div>
      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-700 flex-shrink-0">{progressPct}%</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{completedCount}/{lessons.length} บท</span>
        </div>
      </div>

      {/* Video */}
      {currentLesson?.youtube_id ? (
        <div className="relative bg-black" style={{ paddingBottom: '42%' }}>
          <iframe
            key={currentLesson.id}
            src={getYouTubeEmbedUrl(currentLesson.youtube_id)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentLesson.title}
          />
        </div>
      ) : (
        <div className="bg-gray-900 h-48 flex items-center justify-center">
          <p className="text-gray-500 text-sm">ไม่มีวิดีโอ</p>
        </div>
      )}

      {/* Current lesson controls */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{currentLesson?.title}</div>
          <div className="text-xs text-gray-500">{formatDuration(currentLesson?.duration_sec || 0)}</div>
        </div>
        <button
          onClick={() => markComplete(currentLesson.id)}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
            progressMap[currentLesson?.id]
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
          {progressMap[currentLesson?.id] ? '✓ ดูแล้ว' : 'ทำเครื่องหมายว่าดูแล้ว'}
        </button>
      </div>

      {/* Lesson list */}
      <div className="divide-y divide-gray-100">
        {lessons.map((lesson, i) => {
          const isActive = i === currentIdx
          const isDone = !!progressMap[lesson.id]
          return (
            <button
              key={lesson.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}>
              {/* Status circle */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                isDone ? 'bg-green-100 text-green-700' :
                isActive ? 'bg-blue-600 text-white' :
                'bg-gray-100 text-gray-500'
              }`}>
                {isDone ? '✓' : i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${isActive ? 'font-medium text-blue-700' : 'text-gray-800'}`}>
                  {lesson.title}
                </div>
                <div className="text-xs text-gray-400">{formatDuration(lesson.duration_sec)}</div>
              </div>

              {/* Play icon */}
              {isActive && !isDone && (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="white"><polygon points="1,0 7,4 1,8"/></svg>
                </div>
              )}
              {isDone && <span className="text-xs text-green-600 flex-shrink-0">เสร็จแล้ว</span>}
            </button>
          )
        })}
      </div>

      {/* Next lesson button */}
      {currentIdx < lessons.length - 1 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              markComplete(currentLesson.id)
              setCurrentIdx(i => i + 1)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            บทเรียนถัดไป → {lessons[currentIdx + 1]?.title}
          </button>
        </div>
      )}

      {/* All done */}
      {currentIdx === lessons.length - 1 && progressPct === 100 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-green-50 text-center">
          <p className="text-sm text-green-700 font-medium">✓ เรียนครบทุกบทแล้ว ไปทำแบบทดสอบได้เลย</p>
        </div>
      )}
    </div>
  )
}
