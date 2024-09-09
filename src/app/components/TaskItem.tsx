import React from 'react';
import { Pencil, Trash2, Check, X, Tag, RefreshCw, Calendar } from 'lucide-react';
import { Task, Priority } from '@/types';
import { Category } from '@/app/lib/categoryUtils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, category: Category, deadline: Date | null) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onShowSuggestion: (id: string) => void;
  isEditing: boolean;
  editText: string;
  editCategory: Category;
  editDeadline: string;
  setEditText: (text: string) => void;
  setEditCategory: (category: Category) => void;
  setEditDeadline: (deadline: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  categories: readonly Category[];
  isLoadingSuggestion: boolean;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onPriorityChange,
  onShowSuggestion,
  isEditing,
  editText,
  editCategory,
  editDeadline,
  setEditText,
  setEditCategory,
  setEditDeadline,
  onSaveEdit,
  onCancelEdit,
  categories,
  isLoadingSuggestion,
}: TaskItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const formatDeadline = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <li className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {isEditing ? (
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full sm:w-auto flex-grow p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Edit task title"
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as Category)}
              className="w-full sm:w-auto p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Edit task category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="w-full sm:w-auto p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Edit task deadline"
            />
            <div className="flex space-x-2">
              <button
                onClick={onSaveEdit}
                className="text-green-400 hover:text-green-300"
                aria-label="Save changes"
              >
                <Check size={20} />
              </button>
              <button
                onClick={onCancelEdit}
                className="text-red-400 hover:text-red-300"
                aria-label="Cancel editing"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center flex-grow mb-2 sm:mb-0">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              <span 
                className={`flex-grow ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}
              >
                {task.title}
              </span>
            </div>
            <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
              <span className="px-2 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center">
                <Tag className="mr-1" size={16} />
                {task.category}
              </span>
              {task.deadline && (
                <span className="px-2 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center">
                  <Calendar className="mr-1" size={16} />
                  {formatDeadline(task.deadline)}
                </span>
              )}
              <select
                value={task.priority}
                onChange={(e) => onPriorityChange(task.id, e.target.value as Priority)}
                className="p-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={() => onEdit(task.id, task.title, task.category, task.deadline)}
                className="text-blue-400 hover:text-blue-300"
                aria-label={`Edit "${task.title}"`}
                onKeyDown={(e) => handleKeyDown(e, () => onEdit(task.id, task.title, task.category, task.deadline))}
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-red-400 hover:text-red-300"
                aria-label={`Delete "${task.title}"`}
                onKeyDown={(e) => handleKeyDown(e, () => onDelete(task.id))}
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => onShowSuggestion(task.id)}
                className="text-blue-400 hover:text-blue-300"
                aria-label={`Get AI suggestion for "${task.title}"`}
                disabled={isLoadingSuggestion}
              >
                <RefreshCw size={20} className={isLoadingSuggestion ? 'animate-spin' : ''} />
              </button>
            </div>
          </>
        )}
      </div>
      {task.aiSuggestion && (
        <div className="mt-2 p-2 bg-gray-700 rounded text-sm text-white">
          <strong>AI Suggestion:</strong> {task.aiSuggestion}
        </div>
      )}
    </li>
  );
}