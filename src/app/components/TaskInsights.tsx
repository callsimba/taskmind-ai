import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Task } from '@/app/components/TaskManager';

interface TaskInsightsProps {
  tasks: Task[];
}

export function TaskInsights({ tasks }: TaskInsightsProps) {
  const getDelayedTasks = () => {
    return tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length;
  };

  const getMostCommonCategory = () => {
    const categories = tasks.map(task => task.category);
    return categories.sort((a, b) =>
      categories.filter(v => v === a).length
      - categories.filter(v => v === b).length
    ).pop();
  };

  const getAverageCompletionTime = () => {
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) return 0;
    const totalTime = completedTasks.reduce((sum, task) => {
      const creationDate = new Date(task.id); // Assuming id is a timestamp
      const completionDate = new Date(task.dueDate);
      return sum + (completionDate.getTime() - creationDate.getTime());
    }, 0);
    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Delayed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{getDelayedTasks()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Most Common Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{getMostCommonCategory()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Average Completion Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{getAverageCompletionTime().toFixed(1)} days</p>
        </CardContent>
      </Card>
    </div>
  );
}