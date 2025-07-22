// src/hooks/useBigTaskProgress.ts
import { useCallback } from "react";

type Mood = "Low Energy" | "Stressed" | "Focused";

interface TaskStep {
  id: number;
  description: string;
  completed: boolean;
}

interface BigTaskProgress {
  bigTask: string;
  mood: Mood;
  steps: TaskStep[];
  currentStepIndex: number;
  dateCreated: string;
}

const BIG_TASK_STORAGE_KEY = 'big-task-progress';

export const useBigTaskProgress = () => {
  const saveBigTaskProgress = useCallback((progress: BigTaskProgress) => {
    try {
      localStorage.setItem(BIG_TASK_STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving big task progress:', error);
    }
  }, []);

  const loadBigTaskProgress = useCallback((): BigTaskProgress | null => {
    try {
      const saved = localStorage.getItem(BIG_TASK_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as BigTaskProgress;
      }
    } catch (error) {
      console.error('Error loading big task progress:', error);
    }
    return null;
  }, []);

  const clearBigTaskProgress = useCallback(() => {
    try {
      localStorage.removeItem(BIG_TASK_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing big task progress:', error);
    }
  }, []);

  return {
    saveBigTaskProgress,
    loadBigTaskProgress,
    clearBigTaskProgress,
  };
};