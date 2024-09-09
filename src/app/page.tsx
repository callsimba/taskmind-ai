'use client';

import { useState, useMemo } from 'react';
import { useSettings } from '@/app/components/Settings';
import { useTaskManager, Task } from '@/app/components/TaskManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, CheckCircle2, Clock, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { NaturalLanguageInput } from '@/app/components/NaturalLanguageInput';
import { TaskInsights } from '@/app/components/TaskInsights';
import { useNotifications } from '@/app/hooks/useNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { generateAISuggestions } from '@/app/lib/ai-suggestions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";

export default function Dashboard() {
  const { settings } = useSettings();
  const { tasks, addTask } = useTaskManager();
  const { requestNotificationPermission, scheduleNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');  // Active tab for tab switching
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const sortedAndFilteredTasks = useMemo(() => {
    let filteredTasks = tasks;

    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }
    if (filterCategory !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }
    if (filterDate) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === filterDate;
      });
    }

    return filteredTasks.sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return new Date(b.id).getTime() - new Date(a.id).getTime();
      } else if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  }, [tasks, sortBy, filterPriority, filterCategory, filterDate]);

  const totalPages = Math.ceil(sortedAndFilteredTasks.length / tasksPerPage);
  const paginatedTasks = sortedAndFilteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed);
  const dueTodayTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });
  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate < today && !task.completed;
  });

  const handleNaturalLanguageTask = async (task: { title: string; dueDate: Date | null; category: string }) => {
    let parsedDueDate = task.dueDate || new Date(); // Default to today if no due date is parsed
    
    try {
      // Try to parse the due date and categorize the task using AI or chrono-node
      const response = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.title }),
      });
      
      const { dueDate, category } = await response.json();
      parsedDueDate = dueDate ? new Date(dueDate) : parsedDueDate; // Set parsed due date if available

      const newTask: Task = {
        id: Date.now().toString(),
        title: task.title,
        dueDate: parsedDueDate, // Use parsed due date here
        dueTime: parsedDueDate.toTimeString().slice(0, 5), // Format due time
        completed: false,
        priority: 'medium',
        category: category || task.category, // Use AI-suggested category if available
        aiSuggestions: [],
        aiSuggestionFeedback: null
      };

      // Fetch AI suggestions if possible
      const suggestions = await generateAISuggestions(task.title);
      newTask.aiSuggestions = suggestions;

      // Add the task and schedule notifications
      addTask(newTask);
      scheduleNotification(newTask);

    } catch (error) {
      console.error('Error handling task input:', error);
    }
  };

  const renderTaskList = (taskList: Task[]) => (
    <ScrollArea className="h-[300px] w-full">
      <ul className="space-y-4">
        {taskList.map(task => (
          <li key={task.id} className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Category: {task.category}</p>
            <p className="text-sm text-muted-foreground">Priority: {task.priority}</p>
            {task.aiSuggestions && task.aiSuggestions.length > 0 && (
              <div className="mt-3 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium mb-2">AI Suggestions:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {task.aiSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to AI-Powered To-Do List, {settings.name}!</h1>
      
      <div className="bg-secondary p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Quick Add Task</h2>
        <NaturalLanguageInput onTaskCreated={handleNaturalLanguageTask} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Due Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <span className="text-lg md:text-xl">All Tasks ({sortedAndFilteredTasks.length})</span>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                  <Select onValueChange={setSortBy} defaultValue={sortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateAdded">Date Added</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setFilterPriority} defaultValue={filterPriority}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setFilterCategory} defaultValue={filterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="errands">Errands</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full md:w-[180px]"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTaskList(paginatedTasks)}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full md:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full md:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Due Today ({dueTodayTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>{renderTaskList(dueTodayTasks)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue ({overdueTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>{renderTaskList(overdueTasks)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed This Week ({completedTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>{renderTaskList(completedTasks)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueTodayTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Task Insights</h2>
        <TaskInsights tasks={tasks} />
      </div>

      <Button onClick={requestNotificationPermission} className="mt-6 w-full md:w-auto">
        Enable Notifications
      </Button>
    </div>
  );
}
