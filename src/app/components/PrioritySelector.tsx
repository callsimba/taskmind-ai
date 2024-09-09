import React from 'react';
import { Priority } from '@/types';

interface PrioritySelectorProps {
  priority: Priority;
  onChange: (priority: Priority) => void;
}

const priorityColors = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

export default function PrioritySelector({ priority, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-300">Priority:</span>
      <select
        value={priority}
        onChange={(e) => onChange(e.target.value as Priority)}
        className={`${priorityColors[priority]} text-white rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  );
}