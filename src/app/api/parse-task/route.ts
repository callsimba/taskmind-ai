// File: src/app/api/parse-task/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as chrono from 'chrono-node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { task }: { task: string } = await req.json();
    
    // Use chrono-node to parse the date
    const parsedDate = chrono.parseDate(task);
    const dueDate = parsedDate ? parsedDate : null; // Prefer const here, as dueDate is not reassigned
    
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
    
    // Ensure the dueDate is safely handled in case it's null
    const formattedDueDate = dueDate ? dueDate.toISOString().split('T')[0] : null;

    return NextResponse.json({ dueDate: formattedDueDate, category });
    
  } catch (error) {
    console.error('Error parsing task:', error);
    return NextResponse.json({ message: 'Error parsing task' }, { status: 500 });
  }
}
