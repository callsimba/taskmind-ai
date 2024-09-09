import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { Priority } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { taskDescription } = await req.json();
    console.log('Received task description for prioritization:', taskDescription);

    if (!taskDescription) {
      return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured', priority: 'Medium' as Priority }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that prioritizes tasks. The available priorities are: High, Medium, and Low. Respond with only the priority level.'
        },
        {
          role: 'user',
          content: `Please prioritize this task: "${taskDescription}". Respond with ONLY the priority level (High, Medium, or Low).`
        }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const responsePriority = response.choices[0]?.message?.content?.trim() || 'Medium'; // Fallback to 'Medium' if undefined
    const validPriorities: Priority[] = ['High', 'Medium', 'Low'];

    // Ensure the priority is one of the valid values
    const finalPriority: Priority = validPriorities.includes(responsePriority as Priority)
      ? (responsePriority as Priority)
      : 'Medium'; // Default to 'Medium' if the response is invalid

    // Now return the validated priority
    return NextResponse.json({ priority: finalPriority });
  } catch (error) {
    console.error('Error in prioritize API:', error);
    return NextResponse.json({ error: 'Internal Server Error', priority: 'Medium' as Priority }, { status: 500 });
  }
}
