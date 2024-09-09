import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { generateAISuggestions } from '@/app/lib/ai-suggestions';

export interface AISuggestion {
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  deadline: string;
  steps: string[];
}

interface AISuggestionProps {
  taskTitle: string;
  suggestion: AISuggestion | null;
  isLoading: boolean;
  onAccept: (suggestion: AISuggestion) => void;
}

export default function AISuggestion({ taskTitle, suggestion, isLoading, onAccept }: AISuggestionProps) {
  const [detailedSteps, setDetailedSteps] = useState<string[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  const handleGetDetailedSteps = useCallback(async () => {
    if (taskTitle.length <= 3) return;

    setLoadingSteps(true);
    try {
      const steps = await generateAISuggestions(taskTitle);
      setDetailedSteps(steps);
      if (suggestion) {
        onAccept({ ...suggestion, steps });
      }
    } catch (error) {
      console.error('Error generating detailed steps:', error);
    } finally {
      setLoadingSteps(false);
    }
  }, [taskTitle, suggestion, onAccept]);

  useEffect(() => {
    if (taskTitle.length > 3 && !isLoading && !suggestion?.steps.length) {
      handleGetDetailedSteps();
    }
  }, [taskTitle, isLoading, suggestion, handleGetDetailedSteps]);

  if (taskTitle.length <= 3) {
    return null;
  }

  if (isLoading || loadingSteps) {
    return (
      <div className="mt-2 p-3 bg-gray-800 rounded-lg flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  const stepsToDisplay = suggestion?.steps.length ? suggestion.steps : detailedSteps;

  if (!stepsToDisplay.length) {
    return (
      <div className="mt-2 p-3 bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-300">No AI suggestions available at this time.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg">
      <p className="text-sm text-gray-300 mb-2">
        <span className="font-semibold text-gray-200">AI Suggestions:</span>
      </p>
      {suggestion && (
        <ul className="list-disc list-inside text-sm text-gray-300 mb-2">
          <li>Priority: {suggestion.priority}</li>
          <li>Category: {suggestion.category}</li>
          <li>Deadline: {suggestion.deadline}</li>
        </ul>
      )}
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-200 mb-1">Detailed Steps:</p>
        <ol className="list-decimal list-inside text-sm text-gray-300">
          {stepsToDisplay.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      {!suggestion?.steps.length && detailedSteps.length > 0 && (
        <Button 
          onClick={() => onAccept({ ...suggestion!, steps: detailedSteps })} 
          variant="secondary" 
          size="sm"
          className="mt-2"
        >
          Accept Suggestions
        </Button>
      )}
    </div>
  );
}
