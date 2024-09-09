import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as chrono from 'chrono-node'; // Correctly import chrono-node

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    if (!task) {
      return NextResponse.json({ message: 'Task is required' }, { status: 400 });
    }

    console.log('Task received:', task);

    // Use chrono-node to detect date/time in the task description
    const parsedResults = chrono.parse(task); // This gives all parsed results (date and time)
    let dueDate: Date;

    if (parsedResults.length > 0) {
      // If a date or time is found in the task, use the parsed date and time
      dueDate = parsedResults[0].start.date();
      console.log('Date extracted from task:', dueDate);
    } else {
      // If no date is found, default to today
      dueDate = new Date();
      console.log('No date found, defaulting to today:', dueDate);
    }

    // Check if only the date was parsed without the time, set a default time (e.g., 3:00 PM)
    if (parsedResults.length > 0 && !parsedResults[0].start.isCertain('hour')) {
      dueDate.setHours(15, 0, 0); // Default time to 3:00 PM if no time was parsed
      console.log('No time mentioned, defaulting to 3:00 PM:', dueDate);
    }

    // Create the prompt for OpenAI to generate suggestions
    const prompt = `
      You are an AI assistant specializing in task management and productivity. 
      Your goal is to provide highly specific, actionable steps for completing the following task:
      
      "${task}"

      Analyze the task carefully and generate a list of 5 detailed, practical steps to complete it. Follow these guidelines:
      
      1. Be extremely specific and tailored to the exact task given.
      2. Provide concrete, actionable steps that directly contribute to completing the task.
      3. Consider the context, potential complexities, and any implied deadlines or constraints.
      4. Suggest specific tools, techniques, or resources that are directly relevant to the task.
      5. Ensure each step is a distinct action that moves the task toward completion.

      Format your response as a JSON array of strings, with each string representing a single step.
      Do not include any explanations or additional text outside of the JSON array.
    `;

    console.log('Sending prompt to OpenAI:', prompt);

    // Call OpenAI API to generate task suggestions
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a highly specialized task management AI assistant. Your responses must be extremely detailed, specific, and directly relevant to the given task.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    let content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ message: 'No content in response from OpenAI' }, { status: 500 });
    }

    content = content.replace(/```(?:json)?/g, '').trim();

    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return NextResponse.json({ message: 'Failed to parse AI suggestions' }, { status: 500 });
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json({ message: 'Invalid response format from OpenAI' }, { status: 500 });
    }

    // Return the AI suggestions along with the detected or default due date and time
    return NextResponse.json({ suggestions, dueDate });

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json({ message: 'Error generating AI suggestions' }, { status: 500 });
  }
}
