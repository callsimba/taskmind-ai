'use client'

import { useState, useEffect } from 'react'
import { useTaskManager, Task } from '@/app/components/TaskManager'
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import AISuggestion from '@/app/components/AISuggestion'
import { NaturalLanguageInput } from '@/app/components/NaturalLanguageInput'

interface AISuggestion {
  priority: 'low' | 'medium' | 'high';
  category: string;
  deadline: string;
}

export default function AddTaskPage() {
  const { addTask } = useTaskManager()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (title.length > 3) {
      setIsLoading(true)
      // Simulating AI suggestion generation
      setTimeout(() => {
        const suggestion: AISuggestion = {
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          category: ['Work', 'Personal', 'Shopping', 'Health'][Math.floor(Math.random() * 4)],
          deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
        setAiSuggestion(suggestion)
        setIsLoading(false)
      }, 1000)
    } else {
      setAiSuggestion(null)
    }
  }, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && dueDate && dueTime) {
      const dateTime = new Date(`${dueDate}T${dueTime}`)
      const newTask: Omit<Task, 'id'> = {
        title,
        dueDate: dateTime,
        dueTime,
        completed: false,
        priority,
        category
      }
      addTask(newTask)
      setTitle('')
      setDueDate('')
      setDueTime('')
      setPriority('medium')
      setCategory('')
    }
  }

  const handleAISuggestion = (suggestion: AISuggestion) => {
    setPriority(suggestion.priority)
    setCategory(suggestion.category)
    setDueDate(suggestion.deadline)
  }

  const handleNaturalLanguageTask = (task: { title: string; dueDate: Date | null; category: string }) => {
    const newTask: Omit<Task, 'id'> = {
      title: task.title,
      dueDate: task.dueDate || new Date(),
      dueTime: task.dueDate ? task.dueDate.toTimeString().slice(0, 5) : '00:00',
      completed: false,
      priority: 'medium',
      category: task.category
    }
    addTask(newTask)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Add New Task</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Quick Add with Natural Language</h2>
        <NaturalLanguageInput onTaskCreated={handleNaturalLanguageTask} />
      </div>
      <h2 className="text-xl font-semibold mb-4">Or Add Task Manually</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <AISuggestion
          taskTitle={title}
          suggestion={aiSuggestion}
          isLoading={isLoading}
          onAccept={handleAISuggestion}
        />
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">Due Time</label>
          <Input
            id="dueTime"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <Input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Button type="submit">Add Task</Button>
      </form>
    </div>
  )
}