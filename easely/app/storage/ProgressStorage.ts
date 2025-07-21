import type { Progress } from "../types/progress";

export interface ProgressStorage {
  load(): Progress;
  save(progress: Progress): void;
}