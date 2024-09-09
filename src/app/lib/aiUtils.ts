export async function getAISuggestion(taskDescription: string): Promise<string> {
  try {
    const response = await fetch('/api/suggest', {
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
    return data.suggestion;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    return 'Failed to get AI suggestion. Please try again later.';
  }
}

export async function getAIDeadlineSuggestion(taskDescription: string): Promise<string | null> {
  try {
    const response = await fetch('/api/suggest-deadline', {
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
    return data.deadline;
  } catch (error) {
    console.error('Error getting AI deadline suggestion:', error);
    return null;
  }
}