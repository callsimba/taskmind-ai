// /app/lib/ai-suggestions.ts
export async function generateAISuggestions(taskTitle: string): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task: taskTitle }), // Send the task title to the API route
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI suggestions');
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return ['Unable to generate AI suggestions at this time.'];
  }
}
