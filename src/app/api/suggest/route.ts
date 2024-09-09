import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { taskDescription } = await req.json();
    console.log('Received task description for suggestion:', taskDescription);

    if (!taskDescription) {
      return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured', suggestion: 'AI suggestions are currently unavailable.' }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides suggestions for managing tasks. Keep your responses concise, actionable, and limited to 4 lines maximum.'
        },
        {
          role: 'user',
          content: `Please provide a suggestion for this task: "${taskDescription}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const suggestion = response.choices[0].message?.content || "I'm sorry, I couldn't generate a suggestion at this time.";
    console.log('AI suggestion:', suggestion);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error in suggest API:', error);
    return NextResponse.json({ error: 'Internal Server Error', suggestion: 'Failed to generate a suggestion. Please try again later.' }, { status: 500 });
  }
}
