import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { task }: { task: string } = await req.json();
    console.log('Task received:', task);

    // AI categorization for task
    const prompt = `
      You are an AI that categorizes tasks. Given the following task description, suggest a suitable category:
      
      "${task}"

      Return the category as a single word.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a highly accurate task categorizer.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 10,
      temperature: 0.5,
    });

    const category = response.choices[0]?.message?.content?.trim() || 'General';
    console.log('Task category determined:', category);

    // AI-based deadline suggestion
    const deadlinePrompt = `
      You are an AI that suggests deadlines based on the complexity of the task. 
      Given the following task description, estimate a reasonable due date:
      
      "${task}"

      Consider the urgency and complexity of the task and return a specific date in the format "YYYY-MM-DD".
    `;

    const deadlineResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI that specializes in suggesting task deadlines.' },
        { role: 'user', content: deadlinePrompt }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const dueDate = deadlineResponse.choices[0]?.message?.content?.trim() || new Date().toISOString().split('T')[0];
    console.log('AI suggested deadline:', dueDate);

    // Return the AI category and deadline
    return NextResponse.json({
      category,
      dueDate
    });

  } catch (error) {
    console.error('Error in AI deadline suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
