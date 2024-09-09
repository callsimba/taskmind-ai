'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import TaskItem from './TaskItem'
import ReminderSystem from './ReminderSystem'
import { Task, Priority } from '@/types'
import { getAISuggestion, getAIDeadlineSuggestion } from '@/app/lib/aiUtils'
import { categories, Category, determineCategory } from '@/app/lib/categoryUtils'

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editCategory, setEditCategory] = useState<Category>('Other')
  const [editDeadline, setEditDeadline] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSuggestionId, setLoadingSuggestionId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks, (key, value) => {
        if (key === 'deadline' && value) {
          return new Date(value)
        }
        return value
      }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setIsLoading(true)
      const newTaskId = uuidv4()
      try {
        const category = determineCategory(inputValue.trim())
        const newTask: Task = {
          id: newTaskId,
          title: inputValue.trim(),
          completed: false,
          category,
          priority: 'Medium',
          aiSuggestion: null,
          deadline: null,
        }
        setTasks(prevTasks => [...prevTasks, newTask])
        setInputValue('')
        inputRef.current?.focus()

        const [suggestion, deadlineSuggestion] = await Promise.all([
          getAISuggestion(newTask.title),
          getAIDeadlineSuggestion(newTask.title),
        ])

        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === newTaskId
              ? {
                  ...task,
                  aiSuggestion: suggestion,
                  deadline: deadlineSuggestion ? new Date(deadlineSuggestion) : null,
                }
              : task
          )
        )
      } catch (error) {
        console.error('Error adding task:', error)
        setAiError(`Failed to add task: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  const startEditing = (id: string, title: string, category: Category, deadline: Date | null) => {
    setEditingId(id)
    setEditText(title)
    setEditCategory(category)
    setEditDeadline(deadline ? deadline.toISOString().split('T')[0] : '')
  }

  const saveEdit = async () => {
    if (editingId !== null) {
      setIsLoading(true)
      try {
        const updatedCategory = determineCategory(editText)
        const updatedTask = {
          title: editText,
          category: updatedCategory,
          deadline: editDeadline ? new Date(editDeadline) : null,
        }
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === editingId ? { ...task, ...updatedTask } : task
          )
        )
        setEditingId(null)

        const suggestion = await getAISuggestion(editText)
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === editingId ? { ...task, aiSuggestion: suggestion } : task
          )
        )
      } catch (error) {
        console.error('Error saving edited task:', error)
        setAiError(`Failed to save edited task: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditCategory('Other')
    setEditDeadline('')
  }

  const changePriority = (id: string, priority: Priority) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, priority } : task
      )
    )
  }

  const showSuggestion = async (id: string) => {
    setLoadingSuggestionId(id)
    try {
      const task = tasks.find(t => t.id === id)
      if (task) {
        const [suggestion, deadlineSuggestion] = await Promise.all([
          getAISuggestion(task.title),
          getAIDeadlineSuggestion(task.title),
        ])
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  aiSuggestion: suggestion,
                  deadline: deadlineSuggestion ? new Date(deadlineSuggestion) : t.deadline,
                }
              : t
          )
        )
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      setAiError(`Failed to get AI suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingSuggestionId(null)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch =
      filter === 'all' ? true : filter === 'active' ? !task.completed : task.completed
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter
    return statusMatch && categoryMatch && priorityMatch
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">Tasks</h2>

      <form onSubmit={addTask} className="space-y-2">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            ref={inputRef}
            className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new task"
            aria-label="New task"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            disabled={isLoading || inputValue.trim() === ''}
            aria-label={isLoading ? "Adding task..." : "Add task"}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Plus size={20} className="mr-2" /> Add</>}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors duration-200`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors duration-200`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors duration-200`}
        >
          Completed
        </button>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
          className="px-3 py-1 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
          className="px-3 py-1 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <ul className="space-y-4" role="list" aria-label="Todo list">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
            onEdit={startEditing}
            onPriorityChange={changePriority}
            onShowSuggestion={showSuggestion}
            isEditing={editingId === task.id}
            editText={editText}
            editCategory={editCategory}
            editDeadline={editDeadline}
            setEditText={setEditText}
            setEditCategory={setEditCategory}
            setEditDeadline={setEditDeadline}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            categories={categories}
            isLoadingSuggestion={loadingSuggestionId === task.id}
          />
        ))}
      </ul>

      <ReminderSystem tasks={tasks} />

      {aiError && <p className="text-red-500 mt-4" role="alert">{aiError}</p>}
    </div>
  )
}