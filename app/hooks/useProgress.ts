// src/hooks/useProgress.ts
import { useState, useEffect } from "react";
import type { Mood, Task, Progress } from "../types/progress";
import { LocalStorageAdapter } from "../storage/LocalStorageAdapter";
import type { ProgressStorage } from "../storage/ProgressStorage";

const storage: ProgressStorage = new LocalStorageAdapter();

const fetchStats = async () => {
  const res = await fetch("http://localhost:8000/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

const fetchFocusSessions = async () => {
  const res = await fetch("http://localhost:8000/focus-sessions");
  if (!res.ok) throw new Error("Failed to fetch focus sessions");
  return res.json();
};

export const useProgress = () => {
  const [progress, setProgress] = useState<Progress>(() => storage.load());

  useEffect(() => {
    (async () => {
      try {
        const [stats, sessions] = await Promise.all([fetchStats(), fetchFocusSessions()]);
        setProgress({
          xp: stats.total_xp % 50,
          level: stats.current_level,
          streak: stats.current_streak,
          lastDate: stats.last_active_date || null,
          history: sessions.map((s: { task_title: string; chunk_title?: string; mood: Mood; timestamp: string }) => ({
            task: s.task_title,
            step: s.chunk_title || "N/A",
            mood: s.mood,
            date: new Date(s.timestamp).toLocaleString(),
          })),
        });
      } catch (error) {
        console.error("Failed to load backend progress, falling back to localStorage", error);
        setProgress(storage.load());
      }
    })();
  }, []);

  const addTask = (task: string, step: string, mood: Mood) => {
    // Keep localStorage add for now or build backend endpoint later
    const newTask: Task = {
      task,
      step,
      mood,
      date: new Date().toLocaleString(),
    };
    setProgress((prev) => ({
      ...prev,
      history: [newTask, ...prev.history],
    }));
    storage.save(progress);
  };

  const getRecentTasks = (limit: number) => {
    return progress.history.slice(0, limit);
  };

  const completeTask = async (index: number) => {
    const taskToComplete = progress.history[index];
    if (!taskToComplete) return;
  
    // Call backend to log focus session (XP, mood, etc)
    try {
      const res = await fetch("http://localhost:8000/focus-sessions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_title: taskToComplete.task,
          chunk_title: taskToComplete.step,
          duration: 5,        // You can adjust this
          xp_earned: 10,
          mood: taskToComplete.mood,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete task");
  
      // Refresh stats after logging
      const stats = await fetchStats();
  
      // Remove completed task from local history & update XP/level/streak from backend
      const updatedHistory = [...progress.history];
      updatedHistory.splice(index, 1);
  
      setProgress({
        ...progress,
        xp: stats.total_xp % 50,
        level: stats.current_level,
        streak: stats.current_streak,
        lastDate: stats.last_active_date || null,
        history: updatedHistory,
      });
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return {
    progress,
    addTask,
    completeTask,
    getRecentTasks,
  };
};
