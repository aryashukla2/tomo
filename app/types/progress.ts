export type Mood = "Low Energy" | "Stressed" | "Focused";

export interface Task {
    title: string;
    step: string;
    mood: Mood;
    created_at: string;
    id: number;
  }
  
  export interface Progress {
    xp: number;
    level: number;
    streak: number;
    lastDate: string | null;
    history: Task[];
  }