// src/hooks/useProgress.ts
import { useState } from "react";
import type { Mood, Task, Progress } from "../types/progress";
import { LocalStorageAdapter } from "../storage/LocalStorageAdapter";
import type { ProgressStorage } from "../storage/ProgressStorage";

const storage: ProgressStorage = new LocalStorageAdapter();

export const useProgress = () => {
  const [progress, setProgress] = useState<Progress>(() => storage.load());

  const saveProgress = (updated: Progress) => {
    setProgress(updated);
    storage.save(updated);
  };

  const addTask = (task: string, step: string, mood: Mood) => {
    const newTask: Task = {
      task,
      step,
      mood,
      date: new Date().toLocaleString(),
    };

    saveProgress({
      ...progress,
      history: [newTask, ...progress.history],
    });
  };

  const completeTask = (index: number) => {
    const updatedHistory = [...progress.history];
    updatedHistory.splice(index, 1);

    const xpGain = 10;
    const newXp = progress.xp + xpGain;
    const levelUp = newXp >= 50;

    saveProgress({
      ...progress,
      xp: levelUp ? 0 : newXp,
      level: levelUp ? progress.level + 1 : progress.level,
      history: updatedHistory,
    });
  };

  const getRecentTasks = (limit: number) => {
    return progress.history.slice(0, limit);
  };

  return {
    progress,
    addTask,
    completeTask,
    getRecentTasks,
  };
};
