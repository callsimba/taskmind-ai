import { Priority } from '@/types';

export async function suggestPriority(taskDescription: string): Promise<Priority> {
  try {
    const response = await fetch('/api/prioritize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.priority;
  } catch (error) {
    console.error('Error getting AI priority suggestion:', error);
    return fallbackPrioritization(taskDescription);
  }
}

function fallbackPrioritization(taskDescription: string): Priority {
  const lowercaseDescription = taskDescription.toLowerCase();
  
  if (lowercaseDescription.includes('urgent') || lowercaseDescription.includes('asap') || lowercaseDescription.includes('deadline')) {
    return 'High';
  } else if (lowercaseDescription.includes('important') || lowercaseDescription.includes('soon')) {
    return 'Medium';
  } else {
    return 'Low';
  }
}