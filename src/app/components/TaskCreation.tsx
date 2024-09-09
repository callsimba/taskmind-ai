import React, { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import AISuggestion, { AISuggestion as AISuggestionType } from './AISuggestion';
import { generateAISuggestions } from '../lib/ai-suggestions';

type Task = AISuggestionType;

export function TaskCreation() {
  const [taskTitle, setTaskTitle] = useState('');
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = async () => {
    if (taskTitle.trim().length === 0) return;

    setIsLoading(true);
    try {
      const aiSuggestions = await generateAISuggestions(taskTitle);
      setTask({
        title: taskTitle,
        priority: 'medium',
        category: 'General',
        deadline: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        steps: aiSuggestions,
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = (updatedTask: Task) => {
    setTask(updatedTask);
    console.log('Task with AI suggestions:', updatedTask);
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        placeholder="Enter task title"
      />
      <Button onClick={handleCreateTask} disabled={isLoading || taskTitle.trim().length === 0}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </Button>
      {task && (
        <AISuggestion
          taskTitle={task.title}
          suggestion={task}
          isLoading={isLoading}
          onAccept={handleAcceptSuggestion}
        />
      )}
    </div>
  );
}
