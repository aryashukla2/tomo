// src/components/FirstStepGenerator.jsx
import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { useRouter } from "next/navigation";
import { useProgress } from "./../hooks/useProgress";

const moods = ["Low Energy", "Stressed", "Focused"] as const;
type Mood = (typeof moods)[number];

export default function FirstStepGenerator() {
  const [task, setTask] = useState<string>("");
  const [step, setStep] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [mood, setMood] = useState<Mood>("Low Energy");
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [confettiOpacity, setConfettiOpacity] = useState<number>(1);
  const router = useRouter();
  const { addTask } = useProgress();

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerStarted(false);
          setTimerCompleted(true);
          setShowConfetti(true);
          setConfettiOpacity(1);

          setTimeout(() => {
            setConfettiOpacity(0);
          }, 4000);

          setTimeout(() => {
            setShowConfetti(false);
          }, 5500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, secondsLeft]);

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
          {/* First Step Generation Title Card */}
          <h2 className="text-8xl font-serif font-semibold text-white mb-12">
            First Step Generator
          </h2>

          {/* Input Box */}
          <input
            type="text"
            placeholder="What's your task?"
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

          {/* Generate First Step Button - Added more debugging */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => {
                console.log("Button clicked!"); // Debug log
                generateStep();
              }}
              disabled={!task.trim()}
              className="items-center w-fit p-4 bg-orange-300/50 text-xl font-serif text-white py-2 rounded hover:bg-orange-300/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate First Step
            </button>
          </div>
        </div>

        {/* First Step Display */}
        {step && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              isAnimating
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full pointer-events-none"
            }`}
          >
            <div className="max-w-fit mx-auto text-4xl p-8 rounded-lg text-white font-serif text-center">
              <div className="text-2xl mb-4 opacity-80">Your first step:</div>
              <div className="font-semibold text-6xl mb-10">{step}</div>

              {/* Start Timer Button */}
              <div className="mt-4">
                {!timerStarted && (
                  <button
                    onClick={() => {
                      setSecondsLeft(300); // 5-minute timer (300 seconds, not 5)
                      setTimerStarted(true);
                    }}
                    className="font-serif bg-orange-300/50 text-white px-4 py-2 rounded hover:bg-orange-500/50"
                  >
                    Start 5-Minute Timer
                  </button>
                )}
              </div>

              {/* Timer */}
              {timerStarted && (
                <div className="flex justify-center items-center gap-4 mt-2">
                  <span className="font-serif text-6xl">
                    ⏱{" "}
                    {Math.floor(secondsLeft / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(secondsLeft % 60).toString().padStart(2, "0")}
                  </span>

                  <button
                    onClick={() => {
                      setTimerStarted(false);
                      setSecondsLeft(0);
                    }}
                    className="text-sm bg-red-400/50 p-2 rounded text-white hover:bg-red-500/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Confetti and message when timer completes */}
              {timerCompleted && (
                <>
                  {showConfetti && (
                    <div
                      style={{
                        opacity: confettiOpacity,
                        transition: "opacity 1.5s ease-in-out",
                        pointerEvents: "none",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: 50,
                      }}
                    >
                      <Confetti width={width} height={height} />
                    </div>
                  )}
                  <div className="text-4xl font-semibold text-white mt-4 mb-10">
                    Nice job starting! Keep the momentum going.
                  </div>
                </>
              )}

              {/* Go Back to Generation Button */}
              <button
                onClick={() => {
                  setIsAnimating(false);
                  setTimerCompleted(false);
                  setTimeout(() => {
                    setTask("");
                    setStep("");
                  }, 10);
                }}
                className="mt-6 mb-4 px-3 py-2 bg-blue-400/30 text-lg font-serif text-white rounded hover:bg-white/30 transition-colors"
              >
                Generate Another Step
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Button - Show only before step is generated */}
      {!step && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => router.push("/big-task")}
            className="text-white px-4 py-2 rounded hover:underline font-serif"
          >
            Need Help Breaking Down a Big Task?
          </button>
        </div>
      )}

      {/* Track Progress Button - Only shows with first step */}
      {step && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
            isAnimating
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full pointer-events-none"
          }`}
        >
          <button
            onClick={() => router.push("/progress")}
            className="text-white px-4 py-2 rounded hover:underline font-serif"
          >
            Want to Track Your Progress?
          </button>
        </div>
      )}
    </div>
  );
}
