import { Category } from '@/app/lib/categoryUtils';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  aiSuggestion: string | null;
  deadline: Date | null;
}

export type Priority = 'High' | 'Medium' | 'Low';