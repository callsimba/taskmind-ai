import React, { useState } from 'react'; // Add useState import
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface NaturalLanguageInputProps {
  onTaskCreated: (task: { title: string; dueDate: Date | null; category: string }) => void;
}

export function NaturalLanguageInput({ onTaskCreated }: NaturalLanguageInputProps) {
  const [task, setTask] = useState('');

  const handleTaskSubmit = () => {
    if (!task) return;

    const taskObject = {
      title: task,
      dueDate: null, // Placeholder, you can integrate dueDate parsing logic here
      category: 'General' // Placeholder, you can use AI categorization here
    };

    onTaskCreated(taskObject);
    setTask(''); // Clear input after task creation
  };

  return (
    <div className="flex space-x-4">
      <Input
        type="text"
        placeholder="Enter task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="w-full"
      />
      <Button onClick={handleTaskSubmit} className="w-auto">
        Add Task
      </Button>
    </div>
  );
}
