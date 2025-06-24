// src/components/FirstStepGenerator.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "../hooks/useProgress";

const moods = ["Low Energy", "Stressed", "Focused"] as const;
type Mood = (typeof moods)[number];

export default function BigTask() {
  const [task, setTask] = useState<string>("");
  const [step, setStep] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [mood, setMood] = useState<Mood>("Low Energy");
  const router = useRouter();
  const { addTask } = useProgress();

  // Step generation function with debugging
  const generateStep = () => {
    if (!task.trim()) {
      console.log("Task is empty, returning early"); // Debug log
      return;
    }

    const lower = task.toLowerCase();
    let newStep = "";

    // Generate step based on mood and task
    if (mood === "Low Energy") {
      if (lower.includes("write")) {
        newStep = "Just open your doc and give it a name.";
      } else if (lower.includes("email")) {
        newStep = "Open your inbox. That's it for now.";
      } else {
        newStep = "Take one minute to gather your tools.";
      }
    } else if (mood === "Stressed") {
      newStep = "Take a deep breath. Then just outline the task.";
    } else if (mood === "Focused") {
      if (lower.includes("write")) {
        newStep = "Open your doc and write the first sentence.";
      } else if (lower.includes("email")) {
        newStep = "Write a quick draft — don't worry about perfect.";
      } else {
        newStep = "Start a 5-minute timer and begin the first obvious step.";
      }
    }

    // Save task and add to history - wrap in try-catch for error handling
    try {
      addTask(task, newStep, mood);
      console.log("Task added to history successfully"); // Debug log
    } catch (error) {
      console.error("Error adding task to history:", error);
      // Continue anyway, don't let this block the UI
    }

    setStep(newStep);
    console.log("Step state set"); // Debug log

    // Add a small delay to allow the DOM to render before starting animation
    setTimeout(() => {
      console.log("Starting animation"); // Debug log
      setIsAnimating(true);
    }, 10);
  };

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden">
      <div className="max-w-8xl mx-auto p-10 space-y-12 relative">
        {/* Generator Section */}
        <div
          className={`transition-all duration-1000 ease-in-out ${
            isAnimating
              ? "opacity-0 -translate-y-60 scale-75 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {/* Big Task Title Card */}
          <h2 className="text-8xl font-serif font-semibold text-white mb-12">
            Task Break Down
          </h2>

          {/* Input Box */}
          <input
            type="text"
            placeholder="What's your big task?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full text-3xl font-serif text-white bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-white placeholder-gray-400 pb-1 mb-8"
          />

          {/* Mood Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded font-serif ${
                  mood === m
                    ? "bg-blue-800/30 text-white border-2 border-white"
                    : "bg-blue-400/30 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Generate Smaller Tasks Button - Added more debugging */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => {
                console.log("Button clicked!"); // Debug log
                generateStep();
              }}
              disabled={!task.trim()}
              className="items-center w-fit p-4 bg-orange-300/50 text-xl font-serif text-white py-2 rounded hover:bg-orange-300/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Smaller Steps
            </button>
          </div>
        </div>

        {/* Big Task Display */}
        {step && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              isAnimating
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full pointer-events-none"
            }`}
          >
            <div className="max-w-fit mx-auto text-4xl p-8 rounded-lg text-white font-serif text-center">
              <div className="font-semibold text-4xl mb-6">
                Big Task: {task}
              </div>
              <div className="text-2xl mb-4 opacity-80">Your first step:</div>
              <div className="font-semibold text-6xl mb-8">{step}</div>
              <button
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setTask("");
                    setStep("");
                  }, 10);
                }}
                className="mt-4 mb-4 px-3 py-2 bg-orange-300/50 text-lg font-serif text-white rounded hover:bg-white/30 transition-colors"
              >
                Reveal Next Step
              </button>

              {/* Go Back to Generation Button */}
              <div>
                <button
                  onClick={() => {
                    setIsAnimating(false);
                    setTimeout(() => {
                      setTask("");
                      setStep("");
                    }, 10);
                  }}
                  className="mt-6 mb-4 px-3 py-2 bg-blue-400/30 text-lg font-serif text-white rounded hover:bg-white/30 transition-colors"
                >
                  Have Another Big Task?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Go back to First Step Generator Screen */}
      {!step && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => router.push("/")}
            className="text-white px-4 py-2 rounded hover:underline font-serif"
          >
            Back to First Step Generator
          </button>
        </div>
      )}
    </div>
  );
}
