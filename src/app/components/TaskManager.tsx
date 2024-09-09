'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Task {
  id: string
  title: string
  dueDate: Date
  dueTime: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  aiSuggestions: string[]
  aiSuggestionFeedback: string | null
}

interface TaskManagerContextType {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
}

const TaskManagerContext = createContext<TaskManagerContextType | undefined>(undefined)

export function TaskManagerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  return (
    <TaskManagerContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskManagerContext.Provider>
  )
}

export function useTaskManager() {
  const context = useContext(TaskManagerContext)
  if (context === undefined) {
    throw new Error('useTaskManager must be used within a TaskManagerProvider')
  }
  return context
}