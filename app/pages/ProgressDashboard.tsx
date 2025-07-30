import { useRouter } from "next/navigation";
import { useProgress } from "../hooks/useProgress";
import { useState } from "react";
import type { Task } from "../types/progress";

export default function ProgressDashboard() {
  const router = useRouter();
  const { progress, setProgress } = useProgress();
  const xpPercent = Math.floor((progress.xp / 50) * 100);
  const recentTasks = progress.history.slice(0, 5);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

  const handleCompleteTask = async (task: Task) => {
    setCompletingTaskId(task.id);

    setTimeout(async () => {
      try {
        console.log("✅ Completing task:", task);

        // 1. Log completed session
        const focusSessionRes = await fetch(
          "http://localhost:8000/focus-sessions/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_title: task.title,
              chunk_title: task.step,
              duration: 5,
              xp_earned: 10,
              mood: task.mood,
            }),
          }
        );

        if (!focusSessionRes.ok) {
          const errText = await focusSessionRes.text();
          throw new Error(`Focus session failed: ${errText}`);
        }

        // 2. Delete the original task
        await fetch(`http://localhost:8000/tasks/${task.id}`, {
          method: "DELETE",
        });

        // 3. Refresh tasks and stats
        const [statsRes, tasksRes] = await Promise.all([
          fetch("http://localhost:8000/stats"),
          fetch("http://localhost:8000/tasks"),
        ]);

        const stats = await statsRes.json();
        const updatedTasks = await tasksRes.json();

        // 4. Update progress state
        setProgress({
          xp: stats.total_xp % 50,
          level: stats.current_level,
          streak: stats.current_streak,
          lastDate: stats.last_active_date || null,
          history: updatedTasks.map((t: Task) => ({
            id: t.id,
            title: t.title,
            step: t.step,
            mood: t.mood,
            date: new Date(t.created_at).toLocaleString(),
          })),
        });
      } catch (err) {
        console.error("❌ Failed to complete task:", err);
      }

      setCompletingTaskId(null);
    }, 500);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 text-white font-serif text-center">
      <div className="w-full max-w-xl p-8">
        {/* Progress Dashboard Title */}
        <h1 className="text-4xl font-bold mt-6 mb-6">⋆˙⟡ Your Progress ⋆˙⟡</h1>

        {/* Progress Stats */}
        <div className="space-y-4 text-xl">
          <p>◈ Level: {progress.level}</p>
          <p> XP: {progress?.xp ?? 0}/50</p>
          {/* XP Progress Bar */}
          <div className="w-full h-4 bg-gray-700 rounded">
            <div
              className="h-4 bg-green-400/60 rounded transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p>
            𖤓 Streak: {progress.streak} day{progress.streak !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Task History */}
        <h2 className="mt-10 text-2xl font-semibold">Recent Tasks</h2>
        <ul className="mt-4 space-y-3">
          {recentTasks.map((item: Task) => (
            <li
              key={`${item.id}-${item.created_at}`} // Better key to avoid React issues
              className={`rounded p-3 transition-all duration-500 ${
                completingTaskId === item.id
                  ? "bg-green-600/50 scale-95 opacity-50 transform translate-x-4"
                  : "bg-slate-800"
              }`}
            >
              <p>
                <strong>Task:</strong> {item.title}
              </p>
              <p>
                <strong>Step:</strong> {item.step}
              </p>
              <p className="text-sm text-gray-400">
                {item.created_at}• {item.mood}
              </p>

              {/* Task Completion Button */}
              <button
                onClick={() => handleCompleteTask(item)}
                disabled={completingTaskId === item.id}
                className={`mt-2 px-3 py-1 text-sm rounded text-white transition-colors ${
                  completingTaskId === item.id
                    ? "bg-green-600/60 cursor-not-allowed"
                    : "bg-green-500/40 hover:bg-green-500/20"
                }`}
              >
                {completingTaskId === item.id
                  ? "🎉 Completing..."
                  : "✅ Complete Task (+10 XP)"}
              </button>
            </li>
          ))}
        </ul>

        {/* Default Message When no Tasks */}
        {recentTasks.length === 0 && (
          <p className="text-gray-400 mt-4">
            No tasks yet. Generate your first step!
          </p>
        )}

        {/* Make New Task Button */}
        <button
          onClick={() => router.push("/")}
          className="mt-8 px-4 py-2 bg-blue-500/40 hover:bg-blue-500/20 text-white rounded"
        >
          Generate New Task
        </button>
      </div>
    </div>
  );
}
