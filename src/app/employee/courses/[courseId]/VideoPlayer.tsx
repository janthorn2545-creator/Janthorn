'use client'
import { useState, useEffect, useRef } from 'react'
import { getYouTubeEmbedUrl } from '@/lib/utils'

interface Props {
  lesson: { id: string; title: string; youtube_id?: string; duration_sec: number }
  userId: string
  courseId: string
}

export default function VideoPlayer({ lesson, userId, courseId }: Props) {
  const [completed, setCompleted] = useState(false)

  const markComplete = async () => {
    if (completed) return
    setCompleted(true)
    await fetch('/api/employee/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson.id, completed: true }),
    })
  }

  if (!lesson.youtube_id) {
    return (
      <div className="bg-gray-900 h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm">ไม่มีวิดีโอสำหรับบทเรียนนี้</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative bg-black" style={{ paddingBottom: '40%' }}>
        <iframe
          src={getYouTubeEmbedUrl(lesson.youtube_id)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={lesson.title}
          onLoad={() => setTimeout(markComplete, lesson.duration_sec > 60 ? 60000 : 10000)}
        />
      </div>
      <div className="px-5 py-3 flex items-center justify-between bg-gray-50">
        <span className="text-sm text-gray-700 font-medium">{lesson.title}</span>
        <button onClick={markComplete} disabled={completed}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            completed ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
          {completed ? '✓ ทำเครื่องหมายเสร็จแล้ว' : 'ทำเครื่องหมายว่าดูแล้ว'}
        </button>
      </div>
    </div>
  )
}
