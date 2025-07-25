// src/hooks/useProgress.ts
import { useState, useEffect } from "react";
import type { Mood, Progress } from "../types/progress";
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

  const addTask = async (task: string, step: string, mood: Mood) => {
    try {
      const res = await fetch("http://localhost:8000/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task,
          step: step,
          mood: mood,
          is_chunked: false
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
          task: s.task_title,
          step: s.chunk_title || "N/A",
          mood: s.mood,
          date: new Date(s.timestamp).toLocaleString(),
        })),
      });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return {
    progress,
    addTask,
    setProgress,
  };
};
