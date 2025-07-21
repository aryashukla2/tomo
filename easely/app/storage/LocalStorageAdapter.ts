// src/storage/LocalStorageAdapter.ts
import { ProgressStorage } from "./ProgressStorage";
import type { Progress } from "../types/progress";

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastDate: null,
  history: [],
};

export class LocalStorageAdapter implements ProgressStorage {
  private key = "progress";

  load(): Progress {
    if (typeof window === "undefined") return DEFAULT_PROGRESS;

    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  }

  save(progress: Progress): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.key, JSON.stringify(progress));
  }
}
