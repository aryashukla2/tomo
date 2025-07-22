export type Mood = "Low Energy" | "Stressed" | "Focused";

export interface Task {
    task: string;
    step: string;
    mood: Mood;
    date: string;
    time?: string;
  }
  
  export interface Progress {
    xp: number;
    level: number;
    streak: number;
    lastDate: string | null;
    history: Task[];
  }