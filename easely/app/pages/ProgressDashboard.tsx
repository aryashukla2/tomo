import { useRouter } from "next/navigation";
import { useProgress } from "../hooks/useProgress";
import { useState } from "react";

export default function ProgressDashboard() {
  const router = useRouter();
  const { progress, completeTask, getRecentTasks } = useProgress();
  const xpPercent = Math.floor((progress.xp / 50) * 100);
  const recentTasks = getRecentTasks(5);
  const [completingIndex, setCompletingIndex] = useState<number | null>(null);

  const handleCompleteTask = (index: number) => {
    // Start completion animation
    setCompletingIndex(index);

    // After animation, actually complete the task
    setTimeout(() => {
      completeTask(index); // Remove the task from history
      setCompletingIndex(null);
    }, 500); // Match this with CSS transition duration
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 text-white font-serif text-center">
      <div className="w-full max-w-xl p-8">
        {/* Progress Dashboard Title */}
        <h1 className="text-4xl font-bold mt-6 mb-6">⋆˙⟡ Your Progress ⋆˙⟡</h1>

        {/* Progress Stats */}
        <div className="space-y-4 text-xl">
          <p>◈ Level: {progress.level}</p>
          <p>✰ XP: {progress.xp}/50</p>
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
          {recentTasks.map((item, i) => (
            <li
              key={`${i}-${item.time}`} // Better key to avoid React issues
              className={`rounded p-3 transition-all duration-500 ${
                completingIndex === i
                  ? "bg-green-600/50 scale-95 opacity-50 transform translate-x-4"
                  : "bg-slate-800"
              }`}
            >
              <p>
                <strong>Task:</strong> {item.task}
              </p>
              <p>
                <strong>Step:</strong> {item.step}
              </p>
              <p className="text-sm text-gray-400">
                {item.date} • {item.mood}
              </p>

              {/* Task Completion Button */}
              <button
                onClick={() => handleCompleteTask(i)}
                disabled={completingIndex === i}
                className={`mt-2 px-3 py-1 text-sm rounded text-white transition-colors ${
                  completingIndex === i
                    ? "bg-green-600/60 cursor-not-allowed"
                    : "bg-green-500/40 hover:bg-green-500/20"
                }`}
              >
                {completingIndex === i
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
