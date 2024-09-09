'use client'

import { useEffect } from 'react'
import { Task } from '@/types'

interface ReminderSystemProps {
  tasks: Task[]
}

export default function ReminderSystem({ tasks }: ReminderSystemProps) {
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date()
      tasks.forEach(task => {
        if (task.deadline && !task.completed) {
          const timeDiff = task.deadline.getTime() - now.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

          if (daysDiff === 1) {
            showNotification(task.title, 'This task is due tomorrow!')
          } else if (daysDiff === 0) {
            showNotification(task.title, 'This task is due today!')
          } else if (daysDiff < 0) {
            showNotification(task.title, 'This task is overdue!')
          }
        }
      })
    }

    const intervalId = setInterval(checkDeadlines, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [tasks])

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      })
    }
  }

  return null // This component doesn't render anything
}