// src/hooks/useProgress.ts
import { useState, useEffect } from "react";
import type { Mood, Progress, Task } from "../types/progress";
import { LocalStorageAdapter } from "../storage/LocalStorageAdapter";
import type { ProgressStorage } from "../storage/ProgressStorage";

const storage: ProgressStorage = new LocalStorageAdapter();

const fetchTasks = async () => {
  const res = await fetch("http://localhost:8000/tasks/");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const stats = await fetchStats();
      const backendTasks = await fetchTasks();

      setProgress({
        xp: stats.total_xp % 50,
        level: stats.current_level,
        streak: stats.current_streak,
        lastDate: stats.last_active_date || null,
        history: backendTasks.map((task: Task) => ({
          title: task.title,
          step: task.step,
          mood: task.mood,
          date: new Date(task.created_at).toLocaleString(),
          id: task.id
        })),
      }); 

      setTasks(backendTasks);
    })();
  }, []);

  const addTask = async (task: string, step: string, mood: Mood) => {
    try {
      const res = await fetch("http://localhost:8000/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task,
          step: step,
          mood: mood,
          is_chunked: false,
          created_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");  
  
      // Optionally: refresh focus sessions after adding task
      const sessions = await fetchFocusSessions();
      const stats = await fetchStats();
  
      setProgress({
        xp: stats.total_xp % 50,
        level: stats.current_level,
        streak: stats.current_streak,
        lastDate: stats.last_active_date || null,
        history: sessions.map((s: { task_title: string; chunk_title?: string; mood: Mood; timestamp: string }) => ({
          title: s.task_title,
          step: s.chunk_title || "N/A",
          mood: s.mood,
          date: new Date(s.timestamp).toLocaleString(),
        })),
      });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const completeTask = async (taskId: number) => {
    await fetch(`http://localhost:8000/tasks/${taskId}/complete`, {
      method: "POST",
    });
  
    const stats = await fetchStats();
    const updatedTasks = await fetchTasks();
  
    setProgress({
      xp: stats.total_xp % 50,
      level: stats.current_level,
      streak: stats.current_streak,
      lastDate: stats.last_active_date || null,
      history: updatedTasks.map((task: Task) => ({
        title: task.title,
        step: task.step,
        mood: task.mood,
        date: new Date(task.created_at).toLocaleString(),
        id: task.id
      })),
    });
  };

  return {
    progress,
    addTask,
    setProgress,
    completeTask,
  };
};
