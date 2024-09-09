import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Task {
  id: string;
  title: string;
  category: string;
  dueDate?: Date;
}

export async function POST(req: Request) {
  try {
    const { tasks }: { tasks: Task[] } = await req.json();
    console.log('Received tasks:', tasks);

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ suggestion: "You don't have any tasks yet. Add some tasks to get AI suggestions!" });
    }

    // Summarize task categories
    const taskSummary = tasks.reduce((summary: Record<string, number>, task: Task) => {
      const category = task.category || 'General';
      summary[category] = (summary[category] || 0) + 1;
      return summary;
    }, {});

    const taskSummaryText = Object.entries(taskSummary).map(([category, count]) => `${count} ${category} task(s)`).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides suggestions for managing tasks.'
        },
        {
          role: 'user',
          content: `Here are my current tasks: ${JSON.stringify(tasks)}. There are ${taskSummaryText}. Can you provide some suggestions or insights based on these tasks?`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const suggestion = response.choices[0].message.content;
    console.log('AI suggestion:', suggestion);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
